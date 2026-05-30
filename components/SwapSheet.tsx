"use client";

import { useEffect } from "react";
import { TierBadge } from "@/components/ui";
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

// Bottom-sheet for editing one slot in the plan: change set count, or swap to a
// tier-ranked alternative that trains the same muscle.
export function SwapSheet({
  current,
  sets,
  onSwap,
  onSetsChange,
  onClose,
}: SwapSheetProps) {
  const alts = alternativesForMuscle(current.primaryMuscle);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl border-t border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-3">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
          <h2 className="text-lg font-bold">Edit exercise</h2>
          <p className="text-sm text-muted">
            {MUSCLE_LABELS[current.primaryMuscle]} · pick a swap or change sets
          </p>

          {/* Set count stepper */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface-2 px-4 py-3">
            <span className="font-medium">Working sets</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onSetsChange(sets - 1)}
                className="h-10 w-10 rounded-xl border border-border bg-surface text-xl font-bold active:bg-border"
                aria-label="Fewer sets"
              >
                −
              </button>
              <span className="w-6 text-center text-lg font-bold">{sets}</span>
              <button
                type="button"
                onClick={() => onSetsChange(sets + 1)}
                className="h-10 w-10 rounded-xl border border-border bg-surface text-xl font-bold active:bg-border"
                aria-label="More sets"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Alternatives list (scrolls) */}
        <div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-5"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            Swap to
          </p>
          {alts.map((ex) => {
            const isCurrent = ex.id === current.id;
            return (
              <button
                key={ex.id}
                type="button"
                disabled={isCurrent}
                onClick={() => onSwap(ex.id)}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left ${
                  isCurrent
                    ? "border-accent bg-accent/10"
                    : "border-border bg-surface-2 active:bg-border"
                }`}
              >
                <TierBadge tier={ex.tier} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-semibold">{ex.name}</h3>
                    {isCurrent && (
                      <span className="shrink-0 text-xs font-semibold text-accent">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {ex.equipment} · {ex.repRange.min}–{ex.repRange.max} reps ·{" "}
                    {ex.targetRIR} RIR
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
