"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppData } from "@/components/DataProvider";
import { useRestTimer } from "@/components/RestTimerProvider";
import { Card, SectionLabel, formatWeight } from "@/components/ui";
import { IconCheck, IconChevron, IconPlus } from "@/components/icons";
import { ExerciseDemo } from "@/components/ski/ExerciseDemo";
import { IntervalTimerSheet } from "@/components/ski/IntervalTimerSheet";
import { PainSheet } from "@/components/ski/PainSheet";
import { SkiSetSheet, type SkiSetValues } from "@/components/ski/SkiSetSheet";
import { LADDER_PATTERNS, getSkiExercise } from "@/lib/ski/exercises";
import {
  PAIN_DURING_LIMIT,
  WARMUP_TAG,
  PROGRAM_DAYS,
  addSkiLog,
  dateForIndex,
  deleteSkiLog,
  effectivePlan,
  exerciseIdsForDay,
  exerciseName,
  finishSkiSession,
  lastLogFor,
  logsFor,
  sessionOn,
  setVariant,
  shortDate,
  updateSkiLog,
} from "@/lib/ski/program";
import { DAY_KIND_LABELS, sessionsForDay } from "@/lib/ski/sessions";
import type {
  IntervalSpec,
  SkiProgram,
  SkiSessionItem,
  SkiSetLog,
} from "@/lib/ski/types";

interface SheetTarget {
  exerciseId: string;
  title: string;
  editing?: SkiSetLog;
  initial: SkiSetValues;
}

export default function SkiDayPage() {
  const { day } = useParams<{ day: string }>();
  const index = Number(day);
  const { data, update, ready } = useAppData();
  const router = useRouter();
  const restTimer = useRestTimer();
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  const [timer, setTimer] = useState<{ spec: IntervalSpec; onDone: () => void } | null>(null);
  const [painOpen, setPainOpen] = useState(false);

  const program = data.ski;
  if (!ready) return <p className="mt-6 text-center text-xs text-text-3">Loading…</p>;
  if (!program || !(index >= 0 && index < PROGRAM_DAYS)) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-text-2">No session here.</p>
        <Link href="/ski" className="mt-3 inline-block font-bold text-accent-text">
          Back to Pre-Ski
        </Link>
      </div>
    );
  }

  const date = dateForIndex(program, index);
  const kind = program.schedule[index];
  const sessions = sessionsForDay(kind);
  const record = sessionOn(program, date);
  const dayIds = exerciseIdsForDay(program, kind);
  const loggedToday = new Set(
    program.logs.filter((l) => l.date === date).map((l) => l.exerciseId),
  );

  function log(exerciseId: string, v: Partial<SkiSetValues> & { tag?: string }) {
    const variant = program!.variants[exerciseId];
    update((d) =>
      addSkiLog(d, {
        exerciseId,
        date,
        weight: v.weight ?? 0,
        reps: v.reps ?? 0,
        minutes: v.minutes,
        modality: v.modality,
        tag: v.tag,
        variant,
      }),
    );
  }

  function openLogger(exerciseId: string, title: string, repTarget = 8, editing?: SkiSetLog) {
    const last = lastLogFor(program!, exerciseId, date);
    const ex = getSkiExercise(exerciseId)!;
    const defaultWeight =
      ex.tracking === "height"
        ? data.unit === "kg" ? 40 : 16
        : ex.equipment.includes("barbell") ? (data.unit === "kg" ? 20 : 45) : data.unit === "kg" ? 10 : 25;
    setSheet({
      exerciseId,
      title,
      editing,
      initial: editing
        ? { weight: editing.weight, reps: editing.reps, minutes: editing.minutes, modality: editing.modality }
        : last
          ? { weight: last.weight, reps: last.reps, minutes: last.minutes, modality: last.modality }
          : { weight: defaultWeight, reps: repTarget, minutes: 35 },
    });
  }

  function saveSheet(v: SkiSetValues) {
    if (!sheet) return;
    if (sheet.editing) {
      update((d) => updateSkiLog(d, sheet.editing!.id, v));
    } else {
      log(sheet.exerciseId, v);
      const t = getSkiExercise(sheet.exerciseId)?.tracking;
      if (t === "load" || t === "reps" || t === "height") restTimer.start();
    }
    setSheet(null);
  }

  const candidates = dayIds.map((id) => ({ id, name: exerciseName(id) }));
  const defaultFlagged = dayIds.filter(
    (id) => getSkiExercise(id)?.kneeLoading && loggedToday.has(id),
  );

  return (
    <div>
      <Link href="/ski" className="mb-2 inline-flex items-center gap-1 text-[13px] font-bold text-text-3">
        <span className="rotate-180"><IconChevron s={13} /></span> Pre-Ski
      </Link>
      <div className="mb-4">
        <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-accent-text">
          Week {Math.floor(index / 7) + 1} · Day {(index % 7) + 1} · {shortDate(date)}
        </div>
        <h1 className="mt-0.5 text-[28px] font-extrabold tracking-[-0.02em]">
          {DAY_KIND_LABELS[kind]}
        </h1>
        {program.kneeFriendly && (
          <p className="mt-1 text-[13px] font-semibold text-accent-text">
            Knee-friendly mode on · low-impact swaps applied
          </p>
        )}
      </div>

      {kind === "rest" && (
        <Card>
          <p className="text-[14px] font-medium text-text-2">
            Rest day. An easy walk is fine.
          </p>
        </Card>
      )}

      {sessions.map((s) => (
        <section key={s.key} className="mb-5">
          <SectionLabel>{s.label}</SectionLabel>
          <p className="-mt-1.5 mb-2.5 text-[12.5px] font-medium text-text-3">{s.focus}</p>
          <div className="flex flex-col gap-3">
            {s.items.map((item) => (
              <ItemCard
                key={`${s.key}-${item.exerciseId}`}
                program={program}
                item={item}
                date={date}
                unit={data.unit}
                onLogger={openLogger}
                onLog={log}
                onDelete={(id) => update((d) => deleteSkiLog(d, id))}
                onVariant={(id, v) => update((d) => setVariant(d, id, v))}
                onTimer={(spec, onDone) => setTimer({ spec, onDone })}
              />
            ))}
          </div>
        </section>
      ))}

      {kind !== "rest" && (
        <button
          type="button"
          onClick={() => setPainOpen(true)}
          className={`flex h-[54px] w-full items-center justify-center gap-2 rounded-btn text-base font-bold ${
            record
              ? "border border-accent bg-accent-soft text-accent-text"
              : "bg-accent text-accent-contrast shadow-card"
          }`}
        >
          {record ? (
            <>
              <IconCheck s={18} /> Finished · knee {record.painDuring ?? "–"}/10 · edit
            </>
          ) : (
            "Finish session"
          )}
        </button>
      )}

      {sheet && (
        <SkiSetSheet
          title={sheet.title}
          tracking={getSkiExercise(sheet.exerciseId)!.tracking}
          unit={data.unit}
          loadLabel={getSkiExercise(sheet.exerciseId)!.loadLabel}
          repsLabel={getSkiExercise(sheet.exerciseId)!.repsLabel}
          initial={sheet.initial}
          isEditing={Boolean(sheet.editing)}
          disallowRun={program.kneeFriendly}
          onSave={saveSheet}
          onDelete={() => {
            update((d) => deleteSkiLog(d, sheet.editing!.id));
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      )}

      {timer && (
        <IntervalTimerSheet
          spec={timer.spec}
          onDone={timer.onDone}
          onClose={() => setTimer(null)}
        />
      )}

      {painOpen && (
        <PainSheet
          title="Knee check"
          prompt="How much knee pain did you have during this session?"
          initial={record?.painDuring}
          candidates={candidates}
          defaultFlagged={defaultFlagged}
          needsFlags={(r) => r > PAIN_DURING_LIMIT}
          flagPrompt={`Above ${PAIN_DURING_LIMIT}/10. Which exercises hurt? They'll get the easier variant next time.`}
          onSave={(r, ids) => {
            update((d) => finishSkiSession(d, date, r, ids));
            setPainOpen(false);
            router.push("/ski");
          }}
          onClose={() => setPainOpen(false)}
        />
      )}
    </div>
  );
}

function ItemCard({
  program,
  item,
  date,
  unit,
  onLogger,
  onLog,
  onDelete,
  onVariant,
  onTimer,
}: {
  program: SkiProgram;
  item: SkiSessionItem;
  date: string;
  unit: "kg" | "lb";
  onLogger: (id: string, title: string, repTarget?: number, editing?: SkiSetLog) => void;
  onLog: (id: string, v: Partial<SkiSetValues> & { tag?: string }) => void;
  onDelete: (logId: string) => void;
  onVariant: (id: string, v: "easier" | "harder" | null) => void;
  onTimer: (spec: IntervalSpec, onDone: () => void) => void;
}) {
  const [showDemo, setShowDemo] = useState(false);
  const { plan, replaced } = effectivePlan(program, item);
  const ex = getSkiExercise(plan.exerciseId);
  const original = getSkiExercise(item.exerciseId);
  if (!ex) return null;
  const track = plan.track ?? ex.tracking;
  // Warm-up check-offs are tagged so an exercise that's also in the main
  // session (e.g. Dead Bug on Strength 2 days) keeps separate slots.
  const logs = logsFor(program, ex.id, date).filter(
    (l) => (l.tag === WARMUP_TAG) === (track === "check"),
  );
  const variant = program.variants[ex.id];
  const flag = program.flags[ex.id];
  const last = lastLogFor(program, ex.id, date);
  const done = track === "check" || track === "ladder" ? logs.length > 0 : logs.length >= plan.sets;
  const wUnit = ex.tracking === "height" ? (unit === "kg" ? "cm" : "in") : unit;

  return (
    <Card className={flag ? "border-warn" : ""}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[16.5px] font-extrabold tracking-[-0.01em]">{ex.name}</h2>
          {replaced && original && (
            <p className="text-[12.5px] font-semibold text-text-3 line-through decoration-text-3/60">
              {original.name}
            </p>
          )}
          <p className="mt-1 text-[13px] font-semibold text-text-2">
            {plan.prescription} · {ex.load}
          </p>
          <p className="mt-0.5 text-[12.5px] font-medium leading-snug text-text-3">{ex.cue}</p>
        </div>
        {track === "check" ? (
          <button
            type="button"
            aria-label={done ? "Mark not done" : "Mark done"}
            onClick={() =>
              done
                ? logs.forEach((l) => onDelete(l.id))
                : onLog(ex.id, { reps: plan.repTarget ?? 0, tag: WARMUP_TAG })
            }
            className={`press flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-2 ${
              done ? "border-accent bg-accent text-accent-contrast" : "border-border-strong text-transparent"
            }`}
          >
            <IconCheck s={16} />
          </button>
        ) : (
          <span className={`shrink-0 text-[13px] font-extrabold tabular-nums ${done ? "text-accent-text" : "text-text-2"}`}>
            {track === "ladder"
              ? `${logs.length}/${LADDER_PATTERNS.filter((p) => !(program.kneeFriendly && p.hop)).length}`
              : `${Math.min(logs.length, plan.sets)}/${plan.sets}`}
          </span>
        )}
      </div>

      {flag && (
        <div className="mt-2.5 rounded-input bg-warn/10 px-3 py-2 text-[12.5px] font-semibold text-warn-text">
          Knee flag · {flag.reason}.{" "}
          {ex.easier ? (
            variant === "easier" ? "Using the easier variant." : (
              <button type="button" className="underline" onClick={() => onVariant(ex.id, "easier")}>
                Switch to easier
              </button>
            )
          ) : (
            "No easier variant listed — go lighter or shorten the range."
          )}
        </div>
      )}

      {(ex.easier || ex.harder) && (
        <div className="mt-2.5">
          <div className="flex gap-1.5">
            {([null, ex.easier ? "easier" : null, ex.harder ? "harder" : null] as const)
              .filter((v, i) => i === 0 || v)
              .map((v) => (
                <button
                  key={v ?? "std"}
                  type="button"
                  onClick={() => onVariant(ex.id, v)}
                  className={`press rounded-full border px-3 py-1 text-[12px] font-bold ${
                    (variant ?? null) === v
                      ? "border-accent bg-accent text-accent-contrast"
                      : "border-border bg-surface-2 text-text-2"
                  }`}
                >
                  {v === null ? "Standard" : v === "easier" ? "Easier" : "Harder"}
                </button>
              ))}
          </div>
          {variant && (
            <p className="mt-1.5 text-[12.5px] font-semibold text-text-2">
              {variant === "easier" ? "Easier" : "Harder"}: {variant === "easier" ? ex.easier : ex.harder}
            </p>
          )}
        </div>
      )}

      <div className="mt-2.5 flex items-center gap-3">
        <button type="button" onClick={() => setShowDemo((s) => !s)} className="text-[12.5px] font-bold text-text-3">
          {showDemo ? "Hide demo" : "Show demo"}
        </button>
        {plan.timer && (
          <button
            type="button"
            onClick={() =>
              onTimer(plan.timer!, () => {
                if (track === "check") {
                  if (!done) onLog(ex.id, { reps: plan.repTarget ?? 0, tag: WARMUP_TAG });
                } else if (track === "timed") {
                  for (let i = logs.length; i < plan.sets; i++) onLog(ex.id, { reps: 1 });
                } else {
                  onLogger(ex.id, ex.name);
                }
              })
            }
            className="rounded-full bg-accent-soft px-3 py-1 text-[12.5px] font-bold text-accent-text"
          >
            ▶ Interval timer
          </button>
        )}
      </div>
      {showDemo && (
        <div className="mt-2.5">
          <ExerciseDemo exercise={ex} compact />
        </div>
      )}

      {/* Logging */}
      {(track === "load" || track === "reps" || track === "height") && (
        <div className="mt-3 flex flex-col gap-2">
          {Array.from({ length: Math.max(plan.sets, logs.length) }).map((_, i) => {
            const l = logs[i];
            if (l) {
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onLogger(ex.id, `${ex.name} · Set ${i + 1}`, plan.repTarget, l)}
                  className="press flex w-full items-center justify-between rounded-row border border-border bg-surface-2 px-3.5 py-2.5 text-left"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="w-[34px] text-[12.5px] font-bold text-text-3">Set {i + 1}</span>
                    <span className="text-[17px] font-extrabold tabular-nums">
                      {track === "reps"
                        ? `${l.reps} ${ex.repsLabel ?? "reps"}`
                        : `${formatWeight(l.weight)} ${wUnit} × ${l.reps}`}
                    </span>
                  </span>
                  {l.variant && (
                    <span className="rounded-full bg-accent-soft px-2 py-[3px] text-[11px] font-bold text-accent-text">
                      {l.variant}
                    </span>
                  )}
                </button>
              );
            }
            return (
              <button
                key={`e-${i}`}
                type="button"
                onClick={() => onLogger(ex.id, `${ex.name} · Set ${i + 1}`, plan.repTarget)}
                className="press flex w-full items-center gap-2.5 rounded-row border-[1.5px] border-dashed border-border-strong px-3.5 py-2.5 text-left"
              >
                <span className="shrink-0 text-[13px] font-bold text-text-2">Set {i + 1}</span>
                {last && (
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold tabular-nums text-text-3">
                    Last {track === "reps" ? `${last.reps}` : `${formatWeight(last.weight)} ${wUnit} × ${last.reps}`}
                  </span>
                )}
                <span className={`flex shrink-0 items-center gap-1 text-[13px] font-bold text-accent-text ${last ? "" : "ml-auto"}`}>
                  Log <IconChevron s={13} />
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onLogger(ex.id, `${ex.name} · Set ${Math.max(plan.sets, logs.length) + 1}`, plan.repTarget)}
            className="flex w-full items-center justify-center gap-1.5 pt-1 text-[13px] font-bold text-text-3"
          >
            <IconPlus s={14} /> Add set
          </button>
        </div>
      )}

      {track === "timed" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: plan.sets }).map((_, i) => {
            const l = logs[i];
            return (
              <button
                key={i}
                type="button"
                onClick={() => (l ? onDelete(l.id) : onLog(ex.id, { reps: 1 }))}
                className={`press h-[38px] min-w-[44px] rounded-input border px-2 text-[13px] font-bold ${
                  l ? "border-accent bg-accent text-accent-contrast" : "border-dashed border-border-strong text-text-2"
                }`}
              >
                {plan.sets === 1 ? (l ? "Done ✓" : "Mark done") : i + 1}
              </button>
            );
          })}
        </div>
      )}

      {(track === "intervals" || track === "cardio") && (
        <div className="mt-3">
          {program.kneeFriendly && ex.id === "zone2" && (
            <p className="mb-2 text-[12.5px] font-semibold text-accent-text">
              Knee mode: prefer bike, swim, elliptical or walking over jogging.
            </p>
          )}
          {logs[0] ? (
            <button
              type="button"
              onClick={() => onLogger(ex.id, ex.name, undefined, logs[0])}
              className="press flex w-full items-center justify-between rounded-row border border-border bg-surface-2 px-3.5 py-2.5 text-left text-[15px] font-extrabold"
            >
              {logs[0].modality}
              {logs[0].minutes ? ` · ${logs[0].minutes} min` : " · done"}
              <IconCheck s={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onLogger(ex.id, ex.name)}
              className="press flex w-full items-center justify-between rounded-row border-[1.5px] border-dashed border-border-strong px-3.5 py-2.5 text-left text-[13px] font-bold text-accent-text"
            >
              Log it <IconChevron s={13} />
            </button>
          )}
        </div>
      )}

      {track === "ladder" && (
        <div className="mt-3 flex flex-col gap-1.5">
          {program.kneeFriendly && (
            <p className="text-[12.5px] font-semibold text-accent-text">
              Knee mode: step patterns only — hop patterns are skipped.
            </p>
          )}
          {LADDER_PATTERNS.map((p) => {
            const skipped = program.kneeFriendly && p.hop;
            const l = logs.find((x) => x.tag === p.id);
            return (
              <button
                key={p.id}
                type="button"
                disabled={skipped}
                onClick={() => (l ? onDelete(l.id) : onLog(ex.id, { tag: p.id, reps: 1 }))}
                className={`press flex items-center justify-between rounded-row border px-3.5 py-2 text-left text-[13.5px] font-semibold ${
                  skipped
                    ? "border-border bg-surface-2 text-text-3 line-through"
                    : l
                      ? "border-accent bg-accent-soft text-text"
                      : "border-border bg-surface text-text-2"
                }`}
              >
                {p.name}
                {p.hop && <span className="text-[10.5px] font-bold uppercase text-text-3">hop</span>}
                {l && <IconCheck s={14} />}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
