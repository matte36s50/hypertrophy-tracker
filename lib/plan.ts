import type { AppData, DayKey } from "./types";

// Helpers for editing the user's split (the "plan"). All return a NEW AppData
// and never mutate the input, so they drop straight into DataProvider.update.

// Replace one exercise in a given day with another. If the target already
// exists in that day, we keep the original's position and set count and drop
// the now-duplicate entry.
export function swapExerciseInSplit(
  data: AppData,
  dayKey: DayKey,
  fromId: string,
  toId: string,
): AppData {
  if (fromId === toId) return data;
  const split = data.split.map((d) => {
    if (d.key !== dayKey) return d;
    const replaced = d.exercises.map((e) =>
      e.exerciseId === fromId ? { ...e, exerciseId: toId } : e,
    );
    // De-duplicate (in case toId was already in this day).
    const seen = new Set<string>();
    const exercises = replaced.filter((e) => {
      if (seen.has(e.exerciseId)) return false;
      seen.add(e.exerciseId);
      return true;
    });
    return { ...d, exercises };
  });
  return { ...data, split };
}

// Change the planned number of sets for an exercise on a day (clamped 1–10).
export function setExerciseSets(
  data: AppData,
  dayKey: DayKey,
  exerciseId: string,
  sets: number,
): AppData {
  const clamped = Math.max(1, Math.min(10, Math.round(sets)));
  const split = data.split.map((d) =>
    d.key !== dayKey
      ? d
      : {
          ...d,
          exercises: d.exercises.map((e) =>
            e.exerciseId === exerciseId ? { ...e, sets: clamped } : e,
          ),
        },
  );
  return { ...data, split };
}

// Every exercise id currently used anywhere in the split.
export function exercisesInPlan(data: AppData): Set<string> {
  const ids = new Set<string>();
  for (const d of data.split) for (const e of d.exercises) ids.add(e.exerciseId);
  return ids;
}
