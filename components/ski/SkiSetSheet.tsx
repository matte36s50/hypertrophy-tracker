"use client";

import { useState } from "react";
import type { SkiTracking } from "@/lib/ski/types";
import { Sheet, SheetButton } from "@/components/Sheet";
import { Stepper, formatWeight } from "@/components/ui";
import { IconCheck, IconTrash } from "@/components/icons";

export interface SkiSetValues {
  weight: number;
  reps: number;
  minutes?: number;
  modality?: string;
}

const CARDIO_MODES = ["Jog", "Bike", "Walk", "Swim", "Elliptical", "Stairs"];
const INTERVAL_MODES = ["Run", "Bike", "Rower"];

// Logger for one ski set. Shape adapts to how the exercise is tracked:
// weight × reps, box height × reps, reps only, interval modality, or
// zone-2 minutes + modality.
export function SkiSetSheet({
  title,
  tracking,
  unit,
  loadLabel,
  repsLabel = "Reps",
  initial,
  isEditing,
  // Interval blocks in knee-friendly mode can't be run.
  disallowRun = false,
  onSave,
  onDelete,
  onClose,
}: {
  title: string;
  tracking: SkiTracking;
  unit: "kg" | "lb";
  loadLabel?: string;
  repsLabel?: string;
  initial: SkiSetValues;
  isEditing: boolean;
  disallowRun?: boolean;
  onSave: (v: SkiSetValues) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [weight, setWeight] = useState(initial.weight);
  const [weightStr, setWeightStr] = useState(formatWeight(initial.weight));
  const [reps, setReps] = useState(initial.reps);
  const [minutes, setMinutes] = useState(initial.minutes ?? 35);
  const modes = tracking === "cardio" ? CARDIO_MODES : INTERVAL_MODES;
  const allowed = disallowRun ? modes.filter((m) => m !== "Run") : modes;
  const [modality, setModality] = useState(
    initial.modality && allowed.includes(initial.modality)
      ? initial.modality
      : allowed[0],
  );

  const height = tracking === "height";
  const showWeight = tracking === "load" || height;
  const showReps = tracking === "load" || tracking === "reps" || height;
  const showModes = tracking === "cardio" || tracking === "intervals";
  const wUnit = height ? (unit === "kg" ? "cm" : "in") : unit;
  const step = height ? (unit === "kg" ? 5 : 2) : unit === "kg" ? 2.5 : 5;

  const commitWeight = (): number => {
    const v = parseFloat(weightStr);
    if (!Number.isNaN(v) && v >= 0) {
      const next = Math.round(v * 10) / 10;
      setWeight(next);
      setWeightStr(formatWeight(next));
      return next;
    }
    setWeightStr(formatWeight(weight));
    return weight;
  };
  const nudge = (d: number) => {
    const n = Math.max(0, Math.round((weight + d) * 10) / 10);
    setWeight(n);
    setWeightStr(formatWeight(n));
  };
  const btn =
    "press flex h-[50px] flex-1 items-center justify-center rounded-btn border border-border bg-surface-2 text-[15px] font-extrabold tabular-nums text-text";

  return (
    <Sheet title={title} onClose={onClose}>
      {showWeight && (
        <div className="border-b border-border py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[15px] font-bold text-text">
              {loadLabel ?? "Weight"}
            </span>
            <span className="flex items-baseline">
              <input
                type="text"
                inputMode="decimal"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
                onBlur={commitWeight}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                onFocus={(e) => e.currentTarget.select()}
                aria-label={`${loadLabel ?? "Weight"} in ${wUnit}`}
                className="w-[84px] rounded-none border-0 border-b-2 border-dashed border-border-strong bg-transparent p-0 pb-0.5 text-center text-[26px] font-extrabold tabular-nums text-text outline-none"
              />
              <span className="ml-1 text-[14px] font-semibold text-text-3">
                {wUnit}
              </span>
            </span>
          </div>
          <div className="flex gap-2">
            <button type="button" className={btn} onClick={() => nudge(-step)}>
              −{formatWeight(step)}
            </button>
            <button type="button" className={btn} onClick={() => nudge(step)}>
              +{formatWeight(step)}
            </button>
          </div>
        </div>
      )}

      {showReps && (
        <div className="flex items-center justify-between border-b border-border py-3">
          <span className="text-[15px] font-bold capitalize text-text">
            {repsLabel}
          </span>
          <Stepper value={reps} onChange={setReps} min={0} max={200} />
        </div>
      )}

      {tracking === "cardio" && (
        <div className="flex items-center justify-between border-b border-border py-3">
          <span className="text-[15px] font-bold text-text">Minutes</span>
          <Stepper value={minutes} onChange={setMinutes} min={1} max={180} />
        </div>
      )}

      {showModes && (
        <div className="py-3">
          <div className="mb-2.5 text-[15px] font-bold text-text">
            {tracking === "cardio" ? "Activity" : "Done on"}
          </div>
          <div className="flex flex-wrap gap-2">
            {allowed.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModality(m)}
                className={`press rounded-input border px-3.5 py-2.5 text-[14px] font-bold ${
                  modality === m
                    ? "border-accent bg-accent text-accent-contrast"
                    : "border-border bg-surface-2 text-text-2"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-[18px] flex flex-col gap-2.5">
        <SheetButton
          onClick={() =>
            onSave({
              weight: showWeight ? commitWeight() : 0,
              reps: showReps ? reps : 1,
              minutes: tracking === "cardio" ? minutes : undefined,
              modality: showModes ? modality : undefined,
            })
          }
        >
          <IconCheck s={18} /> {isEditing ? "Save changes" : "Log"}
        </SheetButton>
        {isEditing && onDelete && (
          <SheetButton variant="danger" onClick={onDelete}>
            <IconTrash s={16} /> Delete
          </SheetButton>
        )}
      </div>
    </Sheet>
  );
}
