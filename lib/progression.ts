import type { AppData, SetLog } from "./types";
import { getExercise } from "./exercises";
import { logsForExercise, weightStep } from "./logs";

// --- Double progression engine ---
//
// The rule (RP / double progression): keep the weight the same and add reps
// until you can hit the TOP of your rep range on every working set at your
// target RIR. Do that for 2 sessions in a row, then add weight next time and
// drop back toward the bottom of the range.

export type ProgressionStatus =
  | "add-weight" // earned it: bump the load next session
  | "almost" // hit top once; one more session to go
  | "build-reps" // in range but below the top — chase more reps
  | "no-data"; // nothing logged yet

export interface SessionPerf {
  dateKey: string;
  date: Date;
  workingWeight: number; // heaviest weight used that day
  setsAtWorking: SetLog[];
  topReps: number; // best reps at the working weight
  hitTop: boolean; // all working sets reached top of range at/under target RIR
}

export interface ProgressionAdvice {
  exerciseId: string;
  status: ProgressionStatus;
  currentWeight: number | null;
  suggestedWeight: number | null;
  // How many recent sessions in a row hit the top at the current weight.
  streak: number;
  message: string;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// Group an exercise's logs into per-day sessions, newest first.
export function sessionsForExercise(
  data: AppData,
  exerciseId: string,
): SessionPerf[] {
  const ex = getExercise(exerciseId);
  if (!ex) return [];
  const logs = logsForExercise(data, exerciseId); // newest first

  const byDay = new Map<string, SetLog[]>();
  for (const log of logs) {
    const key = dateKey(new Date(log.loggedAt));
    const bucket = byDay.get(key);
    if (bucket) bucket.push(log);
    else byDay.set(key, [log]);
  }

  const sessions: SessionPerf[] = [];
  for (const [key, sets] of byDay) {
    const workingWeight = Math.max(...sets.map((s) => s.weight));
    // Only count the sets performed at (or above) the top working weight.
    const setsAtWorking = sets.filter((s) => s.weight >= workingWeight);
    const topReps = Math.max(...setsAtWorking.map((s) => s.reps));
    const hitTop =
      setsAtWorking.length > 0 &&
      setsAtWorking.every(
        (s) => s.reps >= ex.repRange.max && s.rir <= ex.targetRIR,
      );
    sessions.push({
      dateKey: key,
      date: new Date(sets[0].loggedAt),
      workingWeight,
      setsAtWorking,
      topReps,
      hitTop,
    });
  }

  // Newest first.
  sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
  return sessions;
}

export function analyzeExercise(
  data: AppData,
  exerciseId: string,
): ProgressionAdvice {
  const ex = getExercise(exerciseId);
  const base: ProgressionAdvice = {
    exerciseId,
    status: "no-data",
    currentWeight: null,
    suggestedWeight: null,
    streak: 0,
    message: "Log a session to start tracking progression.",
  };
  if (!ex) return base;

  const sessions = sessionsForExercise(data, exerciseId);
  if (sessions.length === 0) return base;

  const current = sessions[0];
  const currentWeight = current.workingWeight;

  // Count consecutive recent sessions at THIS weight that hit the top.
  let streak = 0;
  for (const s of sessions) {
    if (s.workingWeight === currentWeight && s.hitTop) streak++;
    else break;
  }

  const step = weightStep(data.unit);
  const unit = data.unit;

  if (streak >= 2) {
    const suggested = round(currentWeight + step);
    return {
      ...base,
      status: "add-weight",
      currentWeight,
      suggestedWeight: suggested,
      streak,
      message: `You hit ${ex.repRange.max} reps at ${fmt(currentWeight)} ${unit} for ${streak} sessions. Add weight: try ${fmt(suggested)} ${unit} for ${ex.repRange.min}–${ex.repRange.max} reps.`,
    };
  }

  if (streak === 1) {
    return {
      ...base,
      status: "almost",
      currentWeight,
      suggestedWeight: currentWeight,
      streak,
      message: `Top of the range hit once at ${fmt(currentWeight)} ${unit}. Do it once more to earn +${fmt(step)} ${unit}.`,
    };
  }

  // In range but below the top: chase reps.
  return {
    ...base,
    status: "build-reps",
    currentWeight,
    suggestedWeight: currentWeight,
    streak: 0,
    message: `Stay at ${fmt(currentWeight)} ${unit}. Push toward ${ex.repRange.max} reps at ${ex.targetRIR} RIR (last best: ${current.topReps} reps).`,
  };
}

// Analyse every exercise the user has logged, returning only the ones with an
// actionable nudge (add-weight first, then almost).
export function progressionNudges(data: AppData): ProgressionAdvice[] {
  const ids = Array.from(new Set(data.logs.map((l) => l.exerciseId)));
  const advice = ids
    .map((id) => analyzeExercise(data, id))
    .filter((a) => a.status === "add-weight" || a.status === "almost");
  const rank = { "add-weight": 0, almost: 1, "build-reps": 2, "no-data": 3 };
  advice.sort((a, b) => rank[a.status] - rank[b.status]);
  return advice;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
