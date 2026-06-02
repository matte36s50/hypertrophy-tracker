import type { AppData, DayKey, WorkoutSession } from "./types";
import { isSameDay, makeId } from "./logs";

// The headline numbers we snapshot when closing out a workout.
export interface SessionSnapshot {
  dayKey: DayKey;
  dayLabel: string;
  complete: boolean;
  setsLogged: number;
  volume: number;
  musclesTrained: number;
}

// The finished session for a given split day on a given calendar day, if one
// has already been stamped.
export function finishedSessionForDay(
  data: AppData,
  dayKey: DayKey,
  day: Date = new Date(),
): WorkoutSession | undefined {
  return data.sessions.find(
    (s) => s.dayKey === dayKey && isSameDay(new Date(s.finishedAt), day),
  );
}

// Stamp (or refresh) today's session for a split day. Idempotent per
// calendar-day + dayKey: re-finishing the same day updates the existing
// record's stats while preserving its original finish time, so logging a few
// more sets and finishing again won't create duplicates.
export function finishSession(
  data: AppData,
  snap: SessionSnapshot,
  now: Date = new Date(),
): AppData {
  const existing = finishedSessionForDay(data, snap.dayKey, now);
  if (existing) {
    return {
      ...data,
      sessions: data.sessions.map((s) =>
        s.id === existing.id ? { ...s, ...snap } : s,
      ),
    };
  }
  const session: WorkoutSession = {
    id: makeId(),
    finishedAt: now.toISOString(),
    ...snap,
  };
  return { ...data, sessions: [...data.sessions, session] };
}
