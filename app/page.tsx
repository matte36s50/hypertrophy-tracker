"use client";

import { useMemo } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card, PageHeader, Pill } from "@/components/ui";
import { getExercise } from "@/lib/exercises";
import { dayForWeekday } from "@/lib/split";
import { MUSCLE_LABELS } from "@/lib/muscles";
import type { MuscleGroup } from "@/lib/types";

export default function TodayPage() {
  const { data, ready } = useAppData();

  const now = new Date();
  const weekday = now.getDay();
  const { day, isToday } = useMemo(
    () => dayForWeekday(weekday, data.split),
    [weekday, data.split],
  );

  // Target sets per muscle for today's session (from the planned set counts).
  const plannedSets = useMemo(() => {
    const counts: Partial<Record<MuscleGroup, number>> = {};
    for (const item of day.exercises) {
      const ex = getExercise(item.exerciseId);
      if (!ex) continue;
      counts[ex.primaryMuscle] = (counts[ex.primaryMuscle] ?? 0) + item.sets;
    }
    return counts;
  }, [day]);

  const totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      <PageHeader
        title={isToday ? `Today · ${day.label}` : `Next: ${day.label}`}
        subtitle={dateLabel}
      />

      {!isToday && (
        <Card className="mb-4 border-warning/30 bg-warning/10">
          <p className="text-sm text-warning">
            Rest day. Here&apos;s your next session so you can preview or get
            ahead.
          </p>
        </Card>
      )}

      {/* Quick summary chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Pill>{day.exercises.length} exercises</Pill>
        <Pill>{totalSets} working sets</Pill>
        {Object.entries(plannedSets).map(([m, n]) => (
          <Pill key={m}>
            {MUSCLE_LABELS[m as MuscleGroup]}: {n}
          </Pill>
        ))}
      </div>

      {/* Exercise list with stubbed logging buttons */}
      <div className="space-y-3">
        {day.exercises.map((item) => {
          const ex = getExercise(item.exerciseId);
          if (!ex) return null;
          return (
            <Card key={item.exerciseId}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">
                    {ex.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted">
                    {MUSCLE_LABELS[ex.primaryMuscle]} · {ex.repRange.min}–
                    {ex.repRange.max} reps · {ex.targetRIR} RIR
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-surface-2 px-2.5 py-1 text-sm font-medium text-muted">
                  {item.sets} sets
                </span>
              </div>

              {/* Per-set log buttons (stubbed in Phase 1). */}
              <div className="mt-3 grid grid-cols-1 gap-2">
                {Array.from({ length: item.sets }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled
                    className="flex items-center justify-between rounded-xl border border-dashed border-border bg-surface-2/50 px-4 py-3 text-left text-sm text-muted disabled:cursor-not-allowed"
                  >
                    <span className="font-medium">Set {i + 1}</span>
                    <span className="text-xs">Tap to log (coming Phase 2)</span>
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        {ready
          ? "Logging arrives in Phase 2 — weight × reps × RIR in one tap."
          : "Loading your data…"}
      </p>
    </div>
  );
}
