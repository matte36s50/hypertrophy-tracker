import type { WorkoutDay, DayKey } from "./types";

// The default Monday / Wednesday / Friday Push-Pull-Legs split.
// weekday: 1 = Monday, 3 = Wednesday, 5 = Friday.
export const DEFAULT_SPLIT: WorkoutDay[] = [
  {
    key: "push",
    label: "Push",
    weekday: 1,
    exercises: [
      { exerciseId: "incline-db-press", sets: 3 },
      { exerciseId: "machine-chest-press", sets: 3 },
      { exerciseId: "db-shoulder-press", sets: 3 },
      { exerciseId: "cable-lateral-raise", sets: 3 },
      { exerciseId: "overhead-cable-ext", sets: 3 },
      { exerciseId: "cable-pushdown", sets: 3 },
      { exerciseId: "skull-crushers", sets: 3 },
    ],
  },
  {
    key: "pull",
    label: "Pull",
    weekday: 3,
    exercises: [
      { exerciseId: "lat-pulldown", sets: 3 },
      { exerciseId: "chest-supported-row", sets: 3 },
      { exerciseId: "reverse-pec-deck", sets: 3 },
      { exerciseId: "incline-db-curl", sets: 3 },
      { exerciseId: "cable-curl", sets: 3 },
    ],
  },
  {
    key: "legs",
    label: "Legs",
    weekday: 5,
    exercises: [
      { exerciseId: "hack-squat", sets: 3 },
      { exerciseId: "romanian-deadlift", sets: 3 },
      { exerciseId: "leg-extension", sets: 3 },
      { exerciseId: "seated-leg-curl", sets: 3 },
      { exerciseId: "hip-thrust", sets: 3 },
      { exerciseId: "standing-calf-raise", sets: 4 },
    ],
  },
];

// Given a JS weekday (0=Sun..6=Sat), find which split day to show.
// On rest days we point to the next upcoming training day.
export function dayForWeekday(
  weekday: number,
  split: WorkoutDay[] = DEFAULT_SPLIT,
): { day: WorkoutDay; isToday: boolean } {
  const exact = split.find((d) => d.weekday === weekday);
  if (exact) return { day: exact, isToday: true };

  // Find the next training day in the week (wrapping around).
  const sorted = [...split].sort((a, b) => a.weekday - b.weekday);
  for (let offset = 1; offset <= 7; offset++) {
    const wd = (weekday + offset) % 7;
    const match = sorted.find((d) => d.weekday === wd);
    if (match) return { day: match, isToday: false };
  }
  return { day: sorted[0], isToday: false };
}

export const DAY_LABELS: Record<DayKey, string> = {
  push: "Push",
  pull: "Pull",
  legs: "Legs",
};
