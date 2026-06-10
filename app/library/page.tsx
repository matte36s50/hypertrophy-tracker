"use client";

import { useMemo } from "react";
import { useAppData } from "@/components/DataProvider";
import { EXERCISES } from "@/lib/exercises";
import { exercisesInPlan } from "@/lib/plan";
import { MUSCLE_LABELS, MUSCLE_ORDER } from "@/lib/muscles";
import { Card, PageHeader, Pill, SectionLabel, TierBadge } from "@/components/ui";
import type { Exercise, MuscleGroup } from "@/lib/types";

export default function LibraryPage() {
  const { data } = useAppData();
  const inPlan = useMemo(() => exercisesInPlan(data), [data]);

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
        subtitle="Movements ranked by hypertrophy tier. Tap “Swap” on the Today tab to slot one in."
      />

      {/* Tier legend — what S / A / B mean at a glance. */}
      <div className="-mt-1 mb-5 flex flex-wrap items-center gap-3.5">
        {(
          [
            ["S", "Best in class"],
            ["A", "Great"],
            ["B", "Solid backup"],
          ] as const
        ).map(([tier, label]) => (
          <span key={tier} className="inline-flex items-center gap-1.5">
            <TierBadge tier={tier} size={22} />
            <span className="text-[12.5px] font-semibold text-text-2">
              {label}
            </span>
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-[22px]">
        {MUSCLE_ORDER.map((muscle) => {
          const list = byMuscle[muscle];
          if (!list || list.length === 0) return null;
          return (
            <section key={muscle}>
              <SectionLabel>{MUSCLE_LABELS[muscle]}</SectionLabel>
              <div className="flex flex-col gap-3">
                {list.map((ex) => (
                  <Card key={ex.id}>
                    <div className="flex gap-3">
                      <TierBadge tier={ex.tier} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-extrabold text-text">
                            {ex.name}
                          </h3>
                          {inPlan.has(ex.id) && (
                            <span className="rounded-full bg-accent-soft px-[7px] py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.04em] text-accent-text">
                              In plan
                            </span>
                          )}
                          {ex.tags?.includes("thor") && (
                            <span className="rounded-full bg-warn/15 px-[7px] py-0.5 text-[10.5px] font-extrabold uppercase tracking-[0.04em] text-warn-text">
                              ⚡ Thor
                            </span>
                          )}
                        </div>
                        {ex.note && (
                          <p className="mt-1.5 text-[13.5px] font-medium leading-snug text-text-2">
                            {ex.note}
                          </p>
                        )}
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          <Pill>
                            <span className="capitalize">{ex.equipment}</span>
                          </Pill>
                          {/* Single text node so the pill's flex gap can't
                              split "8–12 reps" apart. */}
                          <Pill>{`${ex.repRange.min}–${ex.repRange.max} reps`}</Pill>
                          <Pill>{`${ex.targetRIR} RIR`}</Pill>
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
