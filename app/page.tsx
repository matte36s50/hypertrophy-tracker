"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAppData } from "@/components/DataProvider";
import { useRestTimer } from "@/components/RestTimerProvider";
import { Card, RingProgress, formatWeight } from "@/components/ui";
import { IconArrowUp, IconChevron, IconEdit, IconPlus, IconSwap } from "@/components/icons";
import { SetLogSheet, type SetLogValues } from "@/components/SetLogSheet";
import { SwapSheet } from "@/components/SwapSheet";
import { getExercise } from "@/lib/exercises";
import { setExerciseSets, swapExerciseInSplit } from "@/lib/plan";
import { dayForWeekday } from "@/lib/split";
import { MUSCLE_LABELS } from "@/lib/muscles";
import {
  addSet,
  deleteSet,
  lastLogForExercise,
  todaysLogsForExercise,
  updateSet,
  weightStep,
} from "@/lib/logs";
import { analyzeExercise } from "@/lib/progression";
import type { MuscleGroup, SetLog } from "@/lib/types";

// Describes which set the logging sheet is currently editing/adding.
interface SheetTarget {
  exerciseId: string;
  setNumber: number;
  editingId?: string;
  initial: SetLogValues;
}

export default function TodayPage() {
  const { data, ready, update } = useAppData();
  const router = useRouter();
  const restTimer = useRestTimer();
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  // Exercise id currently open in the swap/edit sheet.
  const [swapId, setSwapId] = useState<string | null>(null);

  const now = new Date();
  const weekday = now.getDay();
  const { day, isToday } = useMemo(
    () => dayForWeekday(weekday, data.split),
    [weekday, data.split],
  );

  // Planned & logged sets per muscle for this session (live running counts).
  const muscleBreakdown = useMemo(() => {
    const planned: Partial<Record<MuscleGroup, number>> = {};
    const done: Partial<Record<MuscleGroup, number>> = {};
    for (const item of day.exercises) {
      const ex = getExercise(item.exerciseId);
      if (!ex) continue;
      planned[ex.primaryMuscle] = (planned[ex.primaryMuscle] ?? 0) + item.sets;
      done[ex.primaryMuscle] =
        (done[ex.primaryMuscle] ?? 0) +
        todaysLogsForExercise(data, item.exerciseId).length;
    }
    return (Object.keys(planned) as MuscleGroup[]).map((m) => ({
      m,
      planned: planned[m] ?? 0,
      done: done[m] ?? 0,
    }));
  }, [data, day]);

  const totalPlanned = day.exercises.reduce((s, e) => s + e.sets, 0);
  const totalLogged = day.exercises.reduce(
    (s, e) => s + todaysLogsForExercise(data, e.exerciseId).length,
    0,
  );
  const left = totalPlanned - totalLogged;

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // Build the initial values when opening the sheet for a new set: reuse the
  // last logged values so you only nudge what changed.
  function defaultsFor(exerciseId: string): SetLogValues {
    const ex = getExercise(exerciseId)!;
    const last = lastLogForExercise(data, exerciseId);
    if (last) return { weight: last.weight, reps: last.reps, rir: last.rir };
    return {
      weight: data.unit === "kg" ? 20 : 45,
      reps: ex.repRange.min,
      rir: ex.targetRIR,
    };
  }

  function openAdd(exerciseId: string, setNumber: number) {
    setSheet({ exerciseId, setNumber, initial: defaultsFor(exerciseId) });
  }

  function openEdit(log: SetLog, setNumber: number) {
    setSheet({
      exerciseId: log.exerciseId,
      setNumber,
      editingId: log.id,
      initial: { weight: log.weight, reps: log.reps, rir: log.rir },
    });
  }

  function handleSave(values: SetLogValues) {
    if (!sheet) return;
    if (sheet.editingId) {
      update((d) => updateSet(d, sheet.editingId!, values));
    } else {
      update((d) => addSet(d, { exerciseId: sheet.exerciseId, ...values }));
      // Start the rest timer after logging a new set (not when editing).
      restTimer.start();
    }
    setSheet(null);
  }

  function handleDelete() {
    if (!sheet?.editingId) return;
    update((d) => deleteSet(d, sheet.editingId!));
    setSheet(null);
  }

  function handleSwap(toExerciseId: string) {
    if (!swapId) return;
    update((d) => swapExerciseInSplit(d, day.key, swapId, toExerciseId));
    setSwapId(null);
  }

  function handleSetsChange(sets: number) {
    if (!swapId) return;
    update((d) => setExerciseSets(d, day.key, swapId, sets));
  }

  const sheetExercise = sheet ? getExercise(sheet.exerciseId) : null;
  const swapExercise = swapId ? getExercise(swapId) : null;
  const swapSets =
    day.exercises.find((e) => e.exerciseId === swapId)?.sets ?? 3;

  const statusLine =
    totalPlanned > 0 && totalLogged >= totalPlanned
      ? "Session complete 🎉"
      : totalLogged === 0
        ? "Ready to train"
        : "In progress";

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-accent-text">
            {isToday ? "Today" : "Next up"}
          </div>
          <h1 className="mt-0.5 whitespace-nowrap text-[30px] font-extrabold tracking-[-0.02em]">
            {day.label} Day
          </h1>
          <p className="mt-1 text-sm font-medium text-text-2">{dateLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/plan")}
          className="flex shrink-0 items-center gap-1.5 rounded-input border border-border bg-surface px-3 py-2.5 text-[13.5px] font-bold text-text shadow-card active:bg-surface-2"
        >
          <IconEdit s={15} /> Plan
        </button>
      </div>

      {/* Session progress card */}
      <Card className="mb-3.5">
        <div className="flex items-center gap-4">
          <RingProgress done={totalLogged} total={totalPlanned} />
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold text-text">{statusLine}</div>
            <div className="mt-0.5 text-[13.5px] font-medium text-text-2">
              {left > 0
                ? `${left} sets left across ${day.exercises.length} exercises`
                : `All ${totalPlanned} sets logged`}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {muscleBreakdown.map(({ m, planned, done }) => {
                const met = done >= planned;
                return (
                  <span
                    key={m}
                    className={`rounded-full px-2 py-[3px] text-[11.5px] font-bold tabular-nums ${
                      met
                        ? "bg-accent-soft text-accent-text"
                        : "bg-surface-2 text-text-3"
                    }`}
                  >
                    {MUSCLE_LABELS[m]} {done}/{planned}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Exercise cards */}
      <div className="flex flex-col gap-3">
        {day.exercises.map((item) => {
          const ex = getExercise(item.exerciseId);
          if (!ex) return null;
          const logs = todaysLogsForExercise(data, item.exerciseId);
          // Show at least the planned number of slots; allow extras beyond.
          const slots = Math.max(item.sets, logs.length);
          const advice = analyzeExercise(data, item.exerciseId);
          const ready =
            advice.status === "add-weight" && advice.suggestedWeight != null;
          const complete = logs.length >= item.sets;

          return (
            <Card key={item.exerciseId}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[17.5px] font-extrabold tracking-[-0.01em]">
                    {ex.name}
                  </h2>
                  <p className="mt-1 text-[13.5px] font-medium text-text-2">
                    {MUSCLE_LABELS[ex.primaryMuscle]} · {ex.repRange.min}–
                    {ex.repRange.max} reps · {ex.targetRIR} RIR
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span
                    className={`text-[13.5px] font-extrabold tabular-nums ${
                      complete ? "text-accent-text" : "text-text-2"
                    }`}
                  >
                    {logs.length}/{item.sets}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSwapId(item.exerciseId)}
                    className="flex items-center gap-1.5 text-[12.5px] font-bold text-text-3 active:opacity-70"
                  >
                    <IconSwap s={15} /> Swap
                  </button>
                </div>
              </div>

              {ready && (
                <div className="mt-3 flex items-center gap-2.5 rounded-input bg-accent-soft px-3 py-2.5">
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast">
                    <IconArrowUp s={15} />
                  </span>
                  <span className="text-[13.5px] font-medium text-accent-text">
                    Add weight — try{" "}
                    <b className="font-bold">
                      {formatWeight(advice.suggestedWeight!)} {data.unit}
                    </b>{" "}
                    today
                  </span>
                </div>
              )}

              <div className="mt-3 flex flex-col gap-2">
                {Array.from({ length: slots }).map((_, i) => {
                  const log = logs[i];
                  const setNumber = i + 1;
                  if (log) {
                    return (
                      <button
                        key={log.id}
                        type="button"
                        onClick={() => openEdit(log, setNumber)}
                        className="flex w-full items-center justify-between rounded-row border border-border bg-surface-2 px-3.5 py-3 text-left active:bg-surface-3"
                      >
                        <span className="flex items-baseline gap-3">
                          <span className="w-[34px] text-[12.5px] font-bold text-text-3">
                            Set {setNumber}
                          </span>
                          <span className="text-[19px] font-extrabold tabular-nums text-text">
                            {formatWeight(log.weight)}
                            <span className="text-[13px] font-semibold text-text-3">
                              {" "}
                              {data.unit}
                            </span>{" "}
                            × {log.reps}
                          </span>
                        </span>
                        <span className="rounded-full bg-accent-soft px-2 py-[3px] text-xs font-extrabold tabular-nums text-accent-text">
                          {log.rir} RIR
                        </span>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={`empty-${i}`}
                      type="button"
                      onClick={() => openAdd(item.exerciseId, setNumber)}
                      className="flex w-full items-center justify-between rounded-row border-[1.5px] border-dashed border-border-strong px-3.5 py-3 text-left active:bg-surface-2"
                    >
                      <span className="text-[13.5px] font-bold text-text-2">
                        Set {setNumber}
                      </span>
                      <span className="flex items-center gap-1.5 text-[13px] font-bold text-accent-text">
                        Tap to log <IconChevron s={14} />
                      </span>
                    </button>
                  );
                })}

                {/* Add an extra set beyond the plan. */}
                <button
                  type="button"
                  onClick={() => openAdd(item.exerciseId, slots + 1)}
                  className="flex w-full items-center justify-center gap-1.5 pb-0.5 pt-1.5 text-[13.5px] font-bold text-text-3 active:opacity-70"
                >
                  <IconPlus s={15} /> Add set
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {!ready && (
        <p className="mt-6 text-center text-xs text-text-3">Loading your data…</p>
      )}

      {sheet && sheetExercise && (
        <SetLogSheet
          exercise={sheetExercise}
          setNumber={sheet.setNumber}
          unit={data.unit}
          step={weightStep(data.unit)}
          initial={sheet.initial}
          isEditing={Boolean(sheet.editingId)}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSheet(null)}
        />
      )}

      {swapExercise && (
        <SwapSheet
          current={swapExercise}
          sets={swapSets}
          onSwap={handleSwap}
          onSetsChange={handleSetsChange}
          onClose={() => setSwapId(null)}
        />
      )}
    </div>
  );
}
