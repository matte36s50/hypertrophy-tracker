"use client";

import { useMemo } from "react";
import { EXERCISES } from "@/lib/exercises";
import { MUSCLE_LABELS, MUSCLE_ORDER } from "@/lib/muscles";
import { Card, PageHeader, Pill, TierBadge } from "@/components/ui";
import type { Exercise, MuscleGroup } from "@/lib/types";

export default function LibraryPage() {
  // Group exercises by primary muscle, then sort each group by tier (S→A→B).
  const byMuscle = useMemo(() => {
    const tierRank = { S: 0, A: 1, B: 2 };
    const groups: Partial<Record<MuscleGroup, Exercise[]>> = {};
    for (const ex of EXERCISES) {
      (groups[ex.primaryMuscle] ??= []).push(ex);
    }
    for (const list of Object.values(groups)) {
      list?.sort((a, b) => tierRank[a.tier] - tierRank[b.tier]);
    }
    return groups;
  }, []);

  return (
    <div>
      <PageHeader
        title="Exercise Library"
        subtitle="Movements ranked S / A / B for hypertrophy. Swapping comes in Phase 4."
      />

      <div className="space-y-6">
        {MUSCLE_ORDER.map((muscle) => {
          const list = byMuscle[muscle];
          if (!list || list.length === 0) return null;
          return (
            <section key={muscle}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                {MUSCLE_LABELS[muscle]}
              </h2>
              <div className="space-y-2">
                {list.map((ex) => (
                  <Card key={ex.id}>
                    <div className="flex items-start gap-3">
                      <TierBadge tier={ex.tier} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold">{ex.name}</h3>
                        {ex.note && (
                          <p className="mt-0.5 text-sm text-muted">{ex.note}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Pill>{ex.equipment}</Pill>
                          <Pill>
                            {ex.repRange.min}–{ex.repRange.max} reps
                          </Pill>
                          <Pill>{ex.targetRIR} RIR</Pill>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
