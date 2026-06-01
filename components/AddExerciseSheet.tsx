"use client";

import { useMemo, useState } from "react";
import { Sheet } from "@/components/Sheet";
import { SectionLabel, TierBadge } from "@/components/ui";
import { IconPlus } from "@/components/icons";
import { EXERCISES } from "@/lib/exercises";
import { MUSCLE_LABELS, MUSCLE_ORDER } from "@/lib/muscles";
import type { Exercise, MuscleGroup } from "@/lib/types";

interface AddExerciseSheetProps {
  // Exercise ids already in the day (hidden from the list).
  existing: Set<string>;
  onAdd: (exerciseId: string) => void;
  onClose: () => void;
}

const TIER_RANK = { S: 0, A: 1, B: 2 } as const;

// Bottom-sheet for adding an exercise to a day: a search field + a muscle-
// grouped list (ranked S→A→B) with a "+" affordance. No duplicates.
export function AddExerciseSheet({
  existing,
  onAdd,
  onClose,
}: AddExerciseSheetProps) {
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const g: Partial<Record<MuscleGroup, Exercise[]>> = {};
    for (const ex of EXERCISES) {
      if (existing.has(ex.id)) continue;
      if (q && !ex.name.toLowerCase().includes(q.toLowerCase())) continue;
      (g[ex.primaryMuscle] ??= []).push(ex);
    }
    for (const list of Object.values(g)) {
      list?.sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]);
    }
    return g;
  }, [existing, q]);

  const empty = Object.keys(groups).length === 0;

  return (
    <Sheet title="Add exercise" onClose={onClose}>
      <input
        autoFocus
        placeholder="Search movements…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-3.5 box-border h-[46px] w-full rounded-input border border-border bg-surface-2 px-3.5 text-[15px] font-semibold text-text outline-none focus:border-accent"
      />
      <div className="flex flex-col gap-4">
        {MUSCLE_ORDER.map((m) => {
          const list = groups[m];
          if (!list || list.length === 0) return null;
          return (
            <div key={m}>
              <SectionLabel className="mb-2">{MUSCLE_LABELS[m]}</SectionLabel>
              <div className="flex flex-col gap-2">
                {list.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => onAdd(ex.id)}
                    className="flex w-full items-center gap-3 rounded-row border border-border bg-surface-2 px-3.5 py-2.5 text-left active:bg-surface-3"
                  >
                    <TierBadge tier={ex.tier} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-bold text-text">
                        {ex.name}
                      </div>
                      <div className="text-[12.5px] font-medium capitalize text-text-3">
                        {ex.equipment} · {ex.repRange.min}–{ex.repRange.max} reps
                      </div>
                    </div>
                    <span className="text-accent-text">
                      <IconPlus s={20} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {empty && (
          <p className="p-4 text-center text-sm text-text-3">No matches.</p>
        )}
      </div>
    </Sheet>
  );
}
