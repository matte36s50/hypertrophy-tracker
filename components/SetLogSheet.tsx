"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/types";
import { Sheet, SheetButton } from "@/components/Sheet";
import { formatWeight } from "@/components/ui";
import { IconCheck, IconTrash } from "@/components/icons";

export interface SetLogValues {
  weight: number;
  reps: number;
  rir: number;
}

interface SetLogSheetProps {
  exercise: Exercise;
  setNumber: number;
  unit: "kg" | "lb";
  step: number;
  initial: SetLogValues;
  // When editing an existing set we show a Delete button.
  isEditing: boolean;
  onSave: (values: SetLogValues) => void;
  onDelete?: () => void;
  onClose: () => void;
}

// Bottom-sheet for logging one set: weight × reps × RIR. Designed for thumbs:
// big +/- steppers and a tap-to-pick RIR segment selector.
export function SetLogSheet({
  exercise,
  setNumber,
  unit,
  step,
  initial,
  isEditing,
  onSave,
  onDelete,
  onClose,
}: SetLogSheetProps) {
  const [weight, setWeight] = useState(initial.weight);
  const [reps, setReps] = useState(initial.reps);
  const [rir, setRir] = useState(initial.rir);
  const round = (n: number) => Math.round(n * 10) / 10;

  const bigBtn =
    "flex h-[52px] w-[52px] items-center justify-center rounded-btn border border-border bg-surface-2 text-2xl font-semibold leading-none text-text active:bg-surface-3";

  return (
    <Sheet title={`${exercise.name} · Set ${setNumber}`} onClose={onClose}>
      {/* Weight */}
      <Field label={`Weight (${unit})`}>
        <button
          type="button"
          className={bigBtn}
          onClick={() => setWeight((w) => Math.max(0, round(w - step)))}
          aria-label="Decrease weight"
        >
          −
        </button>
        <span className="min-w-[72px] text-center text-[26px] font-extrabold tabular-nums text-text">
          {formatWeight(weight)}
        </span>
        <button
          type="button"
          className={bigBtn}
          onClick={() => setWeight((w) => round(w + step))}
          aria-label="Increase weight"
        >
          +
        </button>
      </Field>

      {/* Reps */}
      <Field label="Reps">
        <button
          type="button"
          className={bigBtn}
          onClick={() => setReps((r) => Math.max(1, r - 1))}
          aria-label="Decrease reps"
        >
          −
        </button>
        <span className="min-w-[72px] text-center text-[26px] font-extrabold tabular-nums text-text">
          {reps}
        </span>
        <button
          type="button"
          className={bigBtn}
          onClick={() => setReps((r) => r + 1)}
          aria-label="Increase reps"
        >
          +
        </button>
      </Field>

      {/* RIR — 5-segment selector (0–4). */}
      <div className="pb-1 pt-3.5">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[15px] font-bold text-text">Reps in reserve</span>
          <span className="text-[13px] font-semibold text-text-3">
            target {exercise.targetRIR}
          </span>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setRir(v)}
              className={`h-[46px] flex-1 rounded-input border text-base font-extrabold tabular-nums ${
                rir === v
                  ? "border-accent bg-accent text-accent-contrast"
                  : "border-border bg-surface-2 text-text-2"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-[18px] flex flex-col gap-2.5">
        <SheetButton onClick={() => onSave({ weight, reps, rir })}>
          <IconCheck s={18} /> {isEditing ? "Save changes" : "Log set"}
        </SheetButton>
        {isEditing && onDelete && (
          <SheetButton variant="danger" onClick={onDelete}>
            <IconTrash s={16} /> Delete set
          </SheetButton>
        )}
      </div>
    </Sheet>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3">
      <span className="text-[15px] font-bold text-text">{label}</span>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}
