"use client";

import { useEffect, useMemo, useState } from "react";
import { TierBadge } from "@/components/ui";
import { EXERCISES } from "@/lib/exercises";
import { MUSCLE_LABELS, MUSCLE_ORDER } from "@/lib/muscles";
import type { MuscleGroup } from "@/lib/types";

interface AddExerciseSheetProps {
  // Exercise ids already in the day (shown as disabled).
  existing: Set<string>;
  onAdd: (exerciseId: string) => void;
  onClose: () => void;
}

const TIER_RANK = { S: 0, A: 1, B: 2 } as const;

// Bottom-sheet for adding an exercise to a day. Filter by muscle, ranked S→A→B.
export function AddExerciseSheet({
  existing,
  onAdd,
  onClose,
}: AddExerciseSheetProps) {
  const [filter, setFilter] = useState<MuscleGroup | "all">("all");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const list = useMemo(() => {
    return EXERCISES.filter(
      (e) => filter === "all" || e.primaryMuscle === filter,
    ).sort(
      (a, b) =>
        MUSCLE_ORDER.indexOf(a.primaryMuscle) -
          MUSCLE_ORDER.indexOf(b.primaryMuscle) ||
        TIER_RANK[a.tier] - TIER_RANK[b.tier] ||
        a.name.localeCompare(b.name),
    );
  }, [filter]);

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
          <h2 className="text-lg font-bold">Add exercise</h2>

          {/* Muscle filter chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
            >
              All
            </FilterChip>
            {MUSCLE_ORDER.map((m) => (
              <FilterChip
                key={m}
                active={filter === m}
                onClick={() => setFilter(m)}
              >
                {MUSCLE_LABELS[m]}
              </FilterChip>
            ))}
          </div>
        </div>

        <div
          className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-5"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
        >
          {list.map((ex) => {
            const added = existing.has(ex.id);
            return (
              <button
                key={ex.id}
                type="button"
                disabled={added}
                onClick={() => onAdd(ex.id)}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left ${
                  added
                    ? "border-border bg-surface-2 opacity-50"
                    : "border-border bg-surface-2 active:bg-border"
                }`}
              >
                <TierBadge tier={ex.tier} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-semibold">{ex.name}</h3>
                    {added ? (
                      <span className="shrink-0 text-xs text-muted">Added</span>
                    ) : (
                      <span className="shrink-0 text-xs font-semibold text-accent">
                        + Add
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {MUSCLE_LABELS[ex.primaryMuscle]} · {ex.equipment} ·{" "}
                    {ex.repRange.min}–{ex.repRange.max} reps
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
        active
          ? "border-accent bg-accent text-white"
          : "border-border bg-surface-2 text-muted"
      }`}
    >
      {children}
    </button>
  );
}
