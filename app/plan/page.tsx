"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card } from "@/components/ui";
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
  const [activeDay, setActiveDay] = useState<DayKey>(
    data.split[0]?.key ?? "push",
  );
  const [adding, setAdding] = useState(false);

  const day = data.split.find((d) => d.key === activeDay) ?? data.split[0];
  const existing = new Set(day.exercises.map((e) => e.exerciseId));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit plan</h1>
        <Link
          href="/"
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-accent active:bg-border"
        >
          Done
        </Link>
      </div>

      {/* Day selector */}
      <div className="mb-4 flex gap-2">
        {data.split.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setActiveDay(d.key)}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
              d.key === activeDay
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface-2 text-muted"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Rename the day */}
      <Card className="mb-4">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
          Day name
        </label>
        <input
          type="text"
          value={day.label}
          onChange={(e) => update((dd) => setDayLabel(dd, day.key, e.target.value))}
          className="h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-base font-medium text-text outline-none focus:border-accent"
        />
      </Card>

      {/* Exercises with reorder / sets / remove */}
      <div className="space-y-2">
        {day.exercises.map((item, i) => {
          const ex = getExercise(item.exerciseId);
          if (!ex) return null;
          return (
            <Card key={item.exerciseId}>
              <div className="flex items-start gap-2">
                {/* Reorder arrows */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() =>
                      update((dd) => moveExercise(dd, day.key, item.exerciseId, "up"))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-2 text-sm disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === day.exercises.length - 1}
                    onClick={() =>
                      update((dd) =>
                        moveExercise(dd, day.key, item.exerciseId, "down"),
                      )
                    }
                    className="mt-1 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-2 text-sm disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{ex.name}</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {MUSCLE_LABELS[ex.primaryMuscle]}
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          update((dd) =>
                            setExerciseSets(
                              dd,
                              day.key,
                              item.exerciseId,
                              item.sets - 1,
                            ),
                          )
                        }
                        className="h-8 w-8 rounded-lg border border-border bg-surface-2 text-lg font-bold active:bg-border"
                        aria-label="Fewer sets"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-sm">
                        {item.sets} sets
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          update((dd) =>
                            setExerciseSets(
                              dd,
                              day.key,
                              item.exerciseId,
                              item.sets + 1,
                            ),
                          )
                        }
                        className="h-8 w-8 rounded-lg border border-border bg-surface-2 text-lg font-bold active:bg-border"
                        aria-label="More sets"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        update((dd) =>
                          removeExerciseFromDay(dd, day.key, item.exerciseId),
                        )
                      }
                      className="ml-auto text-sm font-medium text-danger active:opacity-70"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {day.exercises.length === 0 && (
          <Card>
            <p className="text-sm text-muted">
              No exercises yet — add one below.
            </p>
          </Card>
        )}
      </div>

      <button
        type="button"
        onClick={() => setAdding(true)}
        className="mt-4 h-12 w-full rounded-xl border border-dashed border-accent/50 text-base font-semibold text-accent active:bg-surface-2"
      >
        + Add exercise
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        To swap a movement for a tier-ranked alternative, use “Swap / edit” on
        the Today screen.
      </p>

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
