// Core domain types for the app. These describe the "shape" of our data and
// are shared everywhere so the editor can catch mistakes for us.

// The muscle groups we track weekly volume for.
export type MuscleGroup =
  | "chest"
  | "front-delts"
  | "side-delts"
  | "rear-delts"
  | "triceps"
  | "back"
  | "lats"
  | "biceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves";

// Nippard-style tier ranking for exercise quality.
export type Tier = "S" | "A" | "B";

// A single exercise in the library.
export interface Exercise {
  id: string;
  name: string;
  // Primary muscle this exercise trains (used for volume counting).
  primaryMuscle: MuscleGroup;
  // Other muscles that get meaningful stimulus.
  secondaryMuscles?: MuscleGroup[];
  tier: Tier;
  equipment: "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight";
  // Default rep range we aim for on this movement.
  repRange: { min: number; max: number };
  // Target reps-in-reserve for working sets.
  targetRIR: number;
  // Short coaching note in plain English.
  note?: string;
}

// The three training days in the default split.
export type DayKey = "push" | "pull" | "legs";

// A day in the split: which exercises and how many sets each.
export interface WorkoutDay {
  key: DayKey;
  label: string;
  // Day of week this lands on (0 = Sunday ... 6 = Saturday).
  weekday: number;
  // Exercise ids in the order we perform them, with target set counts.
  exercises: { exerciseId: string; sets: number }[];
}

// A single logged set. (Used from Phase 2 onward; defined now so the data
// layer is ready.)
export interface SetLog {
  id: string;
  exerciseId: string;
  weight: number; // in the user's chosen unit
  reps: number;
  rir: number; // reps in reserve
  // ISO date string of when it was logged.
  loggedAt: string;
}

// RP-style weekly volume landmarks (sets per muscle per week).
export interface VolumeLandmarks {
  mev: number; // Minimum Effective Volume
  mav: number; // Maximum Adaptive Volume (a sensible middle target)
  mrv: number; // Maximum Recoverable Volume
}

// Everything the app stores. Versioned so we can migrate later and so cloud
// sync has a clean payload to send.
export interface AppData {
  version: number;
  unit: "kg" | "lb";
  // User customisations to the split (exercise swaps etc.).
  split: WorkoutDay[];
  // All logged sets.
  logs: SetLog[];
}
