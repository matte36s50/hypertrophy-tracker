"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card, PageHeader, Pill } from "@/components/ui";
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
  const { data, update, ready } = useAppData();
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  // Exercise id currently open in the swap/edit sheet.
  const [swapId, setSwapId] = useState<string | null>(null);

  const now = new Date();
  const weekday = now.getDay();
  const { day, isToday } = useMemo(
    () => dayForWeekday(weekday, data.split),
    [weekday, data.split],
  );

  // Planned sets per muscle for this session.
  const plannedByMuscle = useMemo(() => {
    const counts: Partial<Record<MuscleGroup, number>> = {};
    for (const item of day.exercises) {
      const ex = getExercise(item.exerciseId);
      if (!ex) continue;
      counts[ex.primaryMuscle] = (counts[ex.primaryMuscle] ?? 0) + item.sets;
    }
    return counts;
  }, [day]);

  // Sets actually logged today per muscle (live running count).
  const loggedByMuscle = useMemo(() => {
    const counts: Partial<Record<MuscleGroup, number>> = {};
    for (const item of day.exercises) {
      const ex = getExercise(item.exerciseId);
      if (!ex) continue;
      const n = todaysLogsForExercise(data, item.exerciseId).length;
      counts[ex.primaryMuscle] = (counts[ex.primaryMuscle] ?? 0) + n;
    }
    return counts;
  }, [data, day]);

  const totalPlanned = day.exercises.reduce((s, e) => s + e.sets, 0);
  const totalLogged = day.exercises.reduce(
    (s, e) => s + todaysLogsForExercise(data, e.exerciseId).length,
    0,
  );

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

  return (
    <div>
      <PageHeader
        title={isToday ? `Today · ${day.label}` : `Next: ${day.label}`}
        subtitle={dateLabel}
      />

      {!isToday && (
        <Card className="mb-4 border-warning/30 bg-warning/10">
          <p className="text-sm text-warning">
            Rest day — but you can still log a session here if you train today.
          </p>
        </Card>
      )}

      {/* Summary chips: live logged vs planned. */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Pill>
          {totalLogged}/{totalPlanned} sets done
        </Pill>
        {Object.entries(plannedByMuscle).map(([m, planned]) => {
          const done = loggedByMuscle[m as MuscleGroup] ?? 0;
          return (
            <Pill key={m}>
              {MUSCLE_LABELS[m as MuscleGroup]}: {done}/{planned}
            </Pill>
          );
        })}
      </div>

      <div className="space-y-3">
        {day.exercises.map((item) => {
          const ex = getExercise(item.exerciseId);
          if (!ex) return null;
          const logs = todaysLogsForExercise(data, item.exerciseId);
          // Show at least the planned number of slots; allow extras beyond.
          const slots = Math.max(item.sets, logs.length);
          const advice = analyzeExercise(data, item.exerciseId);

          return (
            <Card key={item.exerciseId}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-semibold">
                      {ex.name}
                    </h2>
                    {advice.status === "add-weight" &&
                      advice.suggestedWeight != null && (
                        <span className="shrink-0 rounded-md bg-success/20 px-1.5 py-0.5 text-xs font-bold text-success">
                          ↑ {formatWeight(advice.suggestedWeight)} {data.unit}
                        </span>
                      )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted">
                    {MUSCLE_LABELS[ex.primaryMuscle]} · {ex.repRange.min}–
                    {ex.repRange.max} reps · {ex.targetRIR} RIR
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-sm font-medium text-muted">
                    {logs.length}/{item.sets}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSwapId(item.exerciseId)}
                    className="text-xs font-medium text-accent active:opacity-70"
                  >
                    Swap / edit
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {Array.from({ length: slots }).map((_, i) => {
                  const log = logs[i];
                  const setNumber = i + 1;
                  if (log) {
                    return (
                      <button
                        key={log.id}
                        type="button"
                        onClick={() => openEdit(log, setNumber)}
                        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3 text-left active:bg-border"
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-muted">
                            Set {setNumber}
                          </span>
                          <span className="text-base font-bold">
                            {formatWeight(log.weight)} {data.unit} ×{" "}
                            {log.reps}
                          </span>
                        </span>
                        <span className="rounded-md bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">
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
                      className="flex w-full items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 text-left text-muted active:bg-surface-2"
                    >
                      <span className="text-sm font-medium">
                        Set {setNumber}
                      </span>
                      <span className="text-xs">Tap to log →</span>
                    </button>
                  );
                })}

                {/* Add an extra set beyond the plan. */}
                <button
                  type="button"
                  onClick={() => openAdd(item.exerciseId, slots + 1)}
                  className="w-full rounded-xl px-4 py-2 text-center text-sm font-medium text-accent active:bg-surface-2"
                >
                  + Add set
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {!ready && (
        <p className="mt-6 text-center text-xs text-muted">Loading your data…</p>
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

function formatWeight(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
