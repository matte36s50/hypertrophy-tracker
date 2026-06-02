"use client";

import { useState } from "react";
import { Sheet } from "@/components/Sheet";
import { SectionLabel, Stepper, TierBadge } from "@/components/ui";
import { IconChevron } from "@/components/icons";
import { MUSCLE_LABELS } from "@/lib/muscles";
import { alternativesForMuscle } from "@/lib/exercises";
import type { Exercise } from "@/lib/types";

interface SwapSheetProps {
  current: Exercise;
  sets: number;
  onSwap: (toExerciseId: string) => void;
  onSetsChange: (sets: number) => void;
  onClose: () => void;
}

// Bottom-sheet for editing one slot in the plan: change set count live, or swap
// to a tier-ranked alternative that trains the same muscle.
export function SwapSheet({
  current,
  sets,
  onSwap,
  onSetsChange,
  onClose,
}: SwapSheetProps) {
  const alts = alternativesForMuscle(current.primaryMuscle);
  const [localSets, setLocalSets] = useState(sets);

  return (
    <Sheet title="Swap or edit" onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-bold text-text-3">Working sets</div>
          <div className="mt-0.5 text-[15px] font-semibold text-text">
            {current.name}
          </div>
        </div>
        <Stepper
          value={localSets}
          min={1}
          max={10}
          suffix="sets"
          onChange={(n) => {
            setLocalSets(n);
            onSetsChange(n);
          }}
        />
      </div>

      <SectionLabel>Same-muscle alternatives</SectionLabel>
      <div className="flex flex-col gap-2">
        {alts.map((ex) => {
          const isCurrent = ex.id === current.id;
          return (
            <button
              key={ex.id}
              type="button"
              disabled={isCurrent}
              onClick={() => onSwap(ex.id)}
              className={`flex w-full items-center gap-3 rounded-row border px-3.5 py-2.5 text-left ${
                isCurrent
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-surface-2 active:bg-surface-3"
              }`}
            >
              <TierBadge tier={ex.tier} size={30} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[15px] font-bold text-text">
                    {ex.name}
                  </span>
                  {ex.tags?.includes("thor") && (
                    <span className="rounded-full bg-warn/15 px-[6px] py-0.5 text-[10px] font-extrabold uppercase tracking-[0.04em] text-warn-text">
                      ⚡ Thor
                    </span>
                  )}
                </div>
                <div className="mt-px text-[12.5px] font-medium capitalize text-text-3">
                  {ex.equipment} · {ex.repRange.min}–{ex.repRange.max} reps
                </div>
              </div>
              {isCurrent ? (
                <span className="text-xs font-extrabold text-accent-text">
                  Current
                </span>
              ) : (
                <span className="text-text-3">
                  <IconChevron s={18} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
