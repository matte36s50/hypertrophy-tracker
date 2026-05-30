"use client";

import { useMemo } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card, PageHeader } from "@/components/ui";
import { MUSCLE_LABELS, MUSCLE_ORDER, VOLUME_LANDMARKS } from "@/lib/muscles";
import { statusForSets, weeklyVolume } from "@/lib/volume";
import { progressionNudges } from "@/lib/progression";
import { getExercise } from "@/lib/exercises";
import type { MuscleGroup } from "@/lib/types";
import type { VolumeStatus } from "@/lib/volume";

const STATUS_TEXT: Record<VolumeStatus, string> = {
  "under-mev": "Below MEV — add a set or two next week",
  "in-range": "In the productive range — keep progressing",
  "near-mrv": "Near MRV — hold volume, watch recovery",
  "over-mrv": "Over MRV — consider a lighter (deload) week",
};

const STATUS_COLOR: Record<VolumeStatus, string> = {
  "under-mev": "text-warning",
  "in-range": "text-success",
  "near-mrv": "text-warning",
  "over-mrv": "text-danger",
};

export default function ProgressionPage() {
  const { data } = useAppData();

  const volumeMap = useMemo(() => {
    const map: Partial<Record<MuscleGroup, number>> = {};
    for (const v of weeklyVolume(data)) map[v.muscle] = v.sets;
    return map;
  }, [data]);

  const nudges = useMemo(() => progressionNudges(data), [data]);
  const hasLogs = data.logs.length > 0;

  return (
    <div>
      <PageHeader
        title="Progression"
        subtitle="When to add weight, and how your weekly volume stacks up."
      />

      {/* --- Add-weight nudges (double progression) --- */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Add weight?
        </h2>

        {nudges.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">
              {hasLogs
                ? "Nothing to bump yet. Keep chasing the top of your rep range — once you hit it twice in a row at target RIR, a nudge appears here."
                : "Log a few sessions and this fills with “add weight” nudges based on your reps & RIR."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {nudges.map((n) => {
              const ex = getExercise(n.exerciseId);
              if (!ex) return null;
              const isReady = n.status === "add-weight";
              return (
                <Card
                  key={n.exerciseId}
                  className={
                    isReady
                      ? "border-success/40 bg-success/10"
                      : "border-accent/30 bg-accent/5"
                  }
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                        isReady
                          ? "bg-success/20 text-success"
                          : "bg-accent/20 text-accent"
                      }`}
                    >
                      {isReady ? "↑" : "•"}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-semibold">{ex.name}</h3>
                        {isReady && n.suggestedWeight != null && (
                          <span className="shrink-0 rounded-md bg-success/20 px-2 py-0.5 text-sm font-bold text-success">
                            → {fmt(n.suggestedWeight)} {data.unit}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted">{n.message}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* --- Weekly volume vs RP landmarks --- */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Weekly volume (this week)
        </h2>
        <div className="space-y-3">
          {MUSCLE_ORDER.map((muscle) => {
            const sets = volumeMap[muscle] ?? 0;
            const lm = VOLUME_LANDMARKS[muscle];
            const status = statusForSets(muscle, sets);
            const pct = Math.min(100, (sets / lm.mrv) * 100);
            return (
              <Card key={muscle}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="text-base font-semibold">
                    {MUSCLE_LABELS[muscle]}
                  </h3>
                  <span className="text-sm text-muted">
                    {sets} / {lm.mav} sets
                  </span>
                </div>

                <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-0.5 bg-muted/70"
                    style={{ left: `${(lm.mev / lm.mrv) * 100}%` }}
                    title="MEV"
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted">
                  <span>MEV {lm.mev}</span>
                  <span>MAV {lm.mav}</span>
                  <span>MRV {lm.mrv}</span>
                </div>

                <p className={`mt-2 text-sm font-medium ${STATUS_COLOR[status]}`}>
                  {STATUS_TEXT[status]}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
