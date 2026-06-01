"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card, Stepper } from "@/components/ui";
import { IconArrowUp, IconPlus, IconTrash } from "@/components/icons";
import { AddExerciseSheet } from "@/components/AddExerciseSheet";
import { getExercise } from "@/lib/exercises";
import { MUSCLE_LABELS } from "@/lib/muscles";
import {
  addExerciseToDay,
  moveExercise,
  removeExerciseFromDay,
  setDayLabel,
  setExerciseSets,
} from "@/lib/plan";
import type { DayKey } from "@/lib/types";

export default function PlanPage() {
  const { data, update } = useAppData();
  const router = useRouter();
  const [activeDay, setActiveDay] = useState<DayKey>(
    data.split[0]?.key ?? "push",
  );
  const [adding, setAdding] = useState(false);

  const day = data.split.find((d) => d.key === activeDay) ?? data.split[0];
  const existing = new Set(day.exercises.map((e) => e.exerciseId));

  return (
    <div>
      <div className="mb-[18px] flex items-center justify-between">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
          Edit plan
        </h1>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-input bg-accent px-[18px] py-2.5 text-sm font-extrabold text-accent-contrast active:opacity-90"
        >
          Done
        </button>
      </div>

      {/* Day selector */}
      <div className="mb-3.5 flex gap-2">
        {data.split.map((d) => {
          const active = d.key === activeDay;
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => setActiveDay(d.key)}
              className={`flex-1 rounded-row border px-1 py-3 text-[14.5px] font-extrabold ${
                active
                  ? "border-accent bg-accent text-accent-contrast"
                  : "border-border bg-surface text-text-2"
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Rename the day */}
      <Card className="mb-3.5">
        <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.05em] text-text-3">
          Day name
        </label>
        <input
          type="text"
          value={day.label}
          onChange={(e) =>
            update((dd) => setDayLabel(dd, day.key, e.target.value))
          }
          className="box-border h-[46px] w-full rounded-input border border-border bg-surface-2 px-3.5 text-[15.5px] font-bold text-text outline-none focus:border-accent"
        />
      </Card>

      {/* Exercises with reorder / sets / remove */}
      <div className="flex flex-col gap-3">
        {day.exercises.map((item, i) => {
          const ex = getExercise(item.exerciseId);
          if (!ex) return null;
          return (
            <Card key={item.exerciseId}>
              <div className="flex gap-3">
                {/* Reorder arrows */}
                <div className="flex flex-col gap-1.5">
                  <ArrowButton
                    dir="up"
                    disabled={i === 0}
                    onClick={() =>
                      update((dd) =>
                        moveExercise(dd, day.key, item.exerciseId, "up"),
                      )
                    }
                  />
                  <ArrowButton
                    dir="down"
                    disabled={i === day.exercises.length - 1}
                    onClick={() =>
                      update((dd) =>
                        moveExercise(dd, day.key, item.exerciseId, "down"),
                      )
                    }
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-[15.5px] font-extrabold text-text">
                    {ex.name}
                  </h3>
                  <p className="mt-0.5 text-[12.5px] font-semibold text-text-3">
                    {MUSCLE_LABELS[ex.primaryMuscle]}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <Stepper
                      value={item.sets}
                      min={1}
                      max={10}
                      suffix="sets"
                      onChange={(n) =>
                        update((dd) =>
                          setExerciseSets(dd, day.key, item.exerciseId, n),
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update((dd) =>
                          removeExerciseFromDay(dd, day.key, item.exerciseId),
                        )
                      }
                      className="flex items-center gap-1.5 text-[13px] font-bold text-bad-text active:opacity-70"
                    >
                      <IconTrash s={15} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {day.exercises.length === 0 && (
          <Card>
            <p className="text-sm text-text-2">
              No exercises yet — add one below.
            </p>
          </Card>
        )}
      </div>

      <button
        type="button"
        onClick={() => setAdding(true)}
        className="mt-4 flex h-[50px] w-full items-center justify-center gap-1.5 rounded-btn border-[1.5px] border-dashed border-accent text-[15.5px] font-extrabold text-accent-text active:bg-surface-2"
      >
        <IconPlus s={17} /> Add exercise
      </button>

      {adding && (
        <AddExerciseSheet
          existing={existing}
          onAdd={(id) => {
            update((dd) => addExerciseToDay(dd, day.key, id));
            setAdding(false);
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}

// Up/down reorder arrow (the "down" variant simply rotates the up glyph).
function ArrowButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "up" | "down";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={dir === "up" ? "Move up" : "Move down"}
      className="flex h-[30px] w-[30px] items-center justify-center rounded-badge border border-border bg-surface-2 text-text-2 disabled:opacity-30"
    >
      <span className={dir === "down" ? "flex rotate-180" : "flex"}>
        <IconArrowUp s={15} />
      </span>
    </button>
  );
}
