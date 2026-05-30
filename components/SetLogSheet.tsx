"use client";

import { useEffect, useState } from "react";
import type { Exercise } from "@/lib/types";

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

// A bottom-sheet for logging one set: weight × reps × RIR.
// Designed for thumbs: big +/- steppers and tap-to-pick RIR.
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

  // Close on Escape for desktop testing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const clamp = (n: number, min: number) => (n < min ? min : n);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl border-t border-border bg-surface p-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.25rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />

        <div className="mb-1 text-center">
          <h2 className="text-lg font-bold">{exercise.name}</h2>
          <p className="text-sm text-muted">
            Set {setNumber} · target {exercise.repRange.min}–
            {exercise.repRange.max} reps @ {exercise.targetRIR} RIR
          </p>
        </div>

        {/* Weight */}
        <Stepper
          label={`Weight (${unit})`}
          value={weight}
          display={formatWeight(weight)}
          onDec={() => setWeight((w) => clamp(round(w - step), 0))}
          onInc={() => setWeight((w) => round(w + step))}
          onInput={(v) => setWeight(clamp(v, 0))}
        />

        {/* Reps */}
        <Stepper
          label="Reps"
          value={reps}
          display={String(reps)}
          onDec={() => setReps((r) => clamp(r - 1, 0))}
          onInc={() => setReps((r) => r + 1)}
          onInput={(v) => setReps(clamp(Math.round(v), 0))}
        />

        {/* RIR quick-select */}
        <div className="mb-5">
          <p className="mb-2 text-sm font-medium text-muted">
            RIR (reps in reserve)
          </p>
          <div className="grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRir(n)}
                className={`h-12 rounded-xl border text-base font-semibold transition-colors ${
                  rir === n
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface-2 text-text"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={() => onSave({ weight, reps, rir })}
          className="mb-2 h-14 w-full rounded-2xl bg-accent text-lg font-bold text-white active:bg-accent-strong"
        >
          {isEditing ? "Save changes" : "Log set"}
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl border border-border bg-surface-2 font-medium text-text"
          >
            Cancel
          </button>
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="h-12 flex-1 rounded-xl border border-danger/40 bg-danger/10 font-medium text-danger"
            >
              Delete set
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({
  label,
  value,
  display,
  onDec,
  onInc,
  onInput,
}: {
  label: string;
  value: number;
  display: string;
  onDec: () => void;
  onInc: () => void;
  onInput: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium text-muted">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDec}
          className="h-14 w-14 shrink-0 rounded-2xl border border-border bg-surface-2 text-2xl font-bold active:bg-border"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          type="number"
          inputMode="decimal"
          value={Number.isNaN(value) ? "" : display}
          onChange={(e) => onInput(parseFloat(e.target.value))}
          className="h-14 min-w-0 flex-1 rounded-2xl border border-border bg-surface-2 text-center text-2xl font-bold text-text outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={onInc}
          className="h-14 w-14 shrink-0 rounded-2xl border border-border bg-surface-2 text-2xl font-bold active:bg-border"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

// Round to 1 decimal to avoid floating-point noise from repeated +2.5 etc.
function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function formatWeight(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
