import type { AppData, MuscleGroup, SetLog } from "./types";
import { getExercise } from "./exercises";
import { VOLUME_LANDMARKS } from "./muscles";

// Status of a muscle group's weekly volume relative to RP landmarks.
export type VolumeStatus = "under-mev" | "in-range" | "near-mrv" | "over-mrv";

export interface MuscleVolume {
  muscle: MuscleGroup;
  sets: number;
  status: VolumeStatus;
}

// Start of the current training week (Monday 00:00 local time).
export function startOfTrainingWeek(now = new Date()): Date {
  const d = new Date(now);
  const day = d.getDay(); // 0 = Sun
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Count working sets per muscle group for a set of logs within a window.
// Each logged set counts as 1 set for its primary muscle. (Secondary muscles
// are intentionally not counted here to keep weekly volume honest; this can be
// refined in a later phase.)
export function setsByMuscle(logs: SetLog[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const log of logs) {
    const ex = getExercise(log.exerciseId);
    if (!ex) continue;
    counts[ex.primaryMuscle] = (counts[ex.primaryMuscle] ?? 0) + 1;
  }
  return counts;
}

export function statusForSets(muscle: MuscleGroup, sets: number): VolumeStatus {
  const lm = VOLUME_LANDMARKS[muscle];
  if (sets < lm.mev) return "under-mev";
  if (sets > lm.mrv) return "over-mrv";
  if (sets >= lm.mrv - 2) return "near-mrv";
  return "in-range";
}

// Weekly volume summary for the current training week.
export function weeklyVolume(data: AppData, now = new Date()): MuscleVolume[] {
  const weekStart = startOfTrainingWeek(now);
  const weekLogs = data.logs.filter(
    (l) => new Date(l.loggedAt).getTime() >= weekStart.getTime(),
  );
  const counts = setsByMuscle(weekLogs);
  return Object.entries(counts).map(([muscle, sets]) => ({
    muscle: muscle as MuscleGroup,
    sets,
    status: statusForSets(muscle as MuscleGroup, sets),
  }));
}
