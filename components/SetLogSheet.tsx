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
  // Smaller increment for fine weight tweaks (e.g. 0.5 lb microplates).
  fineStep: number;
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
  fineStep,
  initial,
  isEditing,
  onSave,
  onDelete,
  onClose,
}: SetLogSheetProps) {
  const [weight, setWeight] = useState(initial.weight);
  // Free-typing buffer for the weight input; committed on blur/Enter/save.
  const [weightStr, setWeightStr] = useState(formatWeight(initial.weight));
  const [reps, setReps] = useState(initial.reps);
  const [rir, setRir] = useState(initial.rir);
  const round = (n: number) => Math.round(n * 10) / 10;
  const setW = (n: number) => {
    setWeight(n);
    setWeightStr(formatWeight(n));
  };
  const nudge = (delta: number) => setW(Math.max(0, round(weight + delta)));
  // Parse the typed buffer into the weight; revert to the last valid value on
  // invalid input. Returns the committed weight so save can use it directly.
  const commitWeight = (): number => {
    const v = parseFloat(weightStr);
    if (!Number.isNaN(v) && v >= 0) {
      const next = round(v);
      setW(next);
      return next;
    }
    setWeightStr(formatWeight(weight));
    return weight;
  };

  const bigBtn =
    "press flex h-[52px] w-[52px] items-center justify-center rounded-btn border border-border bg-surface-2 text-2xl font-semibold leading-none text-text";
  const weightBtn =
    "press flex h-[50px] flex-1 items-center justify-center rounded-btn border border-border bg-surface-2 text-[15px] font-extrabold tabular-nums leading-none text-text";

  return (
    <Sheet title={`${exercise.name} · Set ${setNumber}`} onClose={onClose}>
      {/* Weight — tap-to-type value plus coarse/fine steppers. */}
      <div className="border-b border-border py-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[15px] font-bold text-text">Weight</span>
          <span className="flex items-baseline">
            <input
              type="text"
              inputMode="decimal"
              value={weightStr}
              onChange={(e) => setWeightStr(e.target.value)}
              onBlur={commitWeight}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              onFocus={(e) => e.currentTarget.select()}
              aria-label={`Weight in ${unit} — tap to type`}
              className="w-[84px] rounded-none border-0 border-b-2 border-dashed border-border-strong bg-transparent p-0 pb-0.5 text-center text-[26px] font-extrabold tabular-nums text-text outline-none"
            />
            <span className="ml-1 text-[14px] font-semibold text-text-3">
              {unit}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={weightBtn}
            onClick={() => nudge(-step)}
            aria-label={`Decrease weight by ${formatWeight(step)}`}
          >
            −{formatWeight(step)}
          </button>
          <button
            type="button"
            className={weightBtn}
            onClick={() => nudge(-fineStep)}
            aria-label={`Decrease weight by ${formatWeight(fineStep)}`}
          >
            −{formatWeight(fineStep)}
          </button>
          <button
            type="button"
            className={weightBtn}
            onClick={() => nudge(fineStep)}
            aria-label={`Increase weight by ${formatWeight(fineStep)}`}
          >
            +{formatWeight(fineStep)}
          </button>
          <button
            type="button"
            className={weightBtn}
            onClick={() => nudge(step)}
            aria-label={`Increase weight by ${formatWeight(step)}`}
          >
            +{formatWeight(step)}
          </button>
        </div>
      </div>

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
              className={`press h-[46px] flex-1 rounded-input border text-base font-extrabold tabular-nums ${
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
        {/* Commit any in-progress typed weight so a save without blurring
            first doesn't lose it. */}
        <SheetButton onClick={() => onSave({ weight: commitWeight(), reps, rir })}>
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
