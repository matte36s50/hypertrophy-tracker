import type { AppData } from "./types";
import { sessionsForExercise } from "./progression";

export interface SessionPoint {
  date: Date;
  label: string; // short date label for the x-axis
  topWeight: number; // heaviest working weight that session
  totalVolume: number; // sum of weight × reps across all sets
  bestReps: number; // best reps at the working weight
  sets: number;
}

// Ids of exercises that have at least one logged set, newest activity first.
export function loggedExerciseIds(data: AppData): string[] {
  const lastSeen = new Map<string, number>();
  for (const l of data.logs) {
    const t = new Date(l.loggedAt).getTime();
    lastSeen.set(l.exerciseId, Math.max(lastSeen.get(l.exerciseId) ?? 0, t));
  }
  return Array.from(lastSeen.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

// A per-session time series for one exercise, oldest → newest (left → right).
export function seriesForExercise(
  data: AppData,
  exerciseId: string,
): SessionPoint[] {
  const sessions = sessionsForExercise(data, exerciseId); // newest first
  const points = sessions.map((s) => {
    // Re-derive total volume from every set that day (not just working sets).
    const dayLogs = data.logs.filter(
      (l) =>
        l.exerciseId === exerciseId &&
        sameDayKey(new Date(l.loggedAt), s.date),
    );
    const totalVolume = dayLogs.reduce((sum, l) => sum + l.weight * l.reps, 0);
    return {
      date: s.date,
      label: s.date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      topWeight: s.workingWeight,
      totalVolume: Math.round(totalVolume),
      bestReps: s.topReps,
      sets: dayLogs.length,
    };
  });
  // Oldest first for left-to-right charts.
  return points.reverse();
}

function sameDayKey(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
