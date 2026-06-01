import type { AppData, SetLog } from "./types";

// Create a unique-enough id without external dependencies.
export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// True if two dates fall on the same local calendar day.
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// Weight step for the coarse +/- buttons, sensible per unit.
export function weightStep(unit: AppData["unit"]): number {
  return unit === "kg" ? 2.5 : 5;
}

// Fine weight step for nudging by the smallest plate (0.5 lb / 0.5 kg).
export function fineWeightStep(_unit: AppData["unit"]): number {
  return 0.5;
}

// All logs for one exercise, newest first.
export function logsForExercise(data: AppData, exerciseId: string): SetLog[] {
  return data.logs
    .filter((l) => l.exerciseId === exerciseId)
    .sort(
      (a, b) =>
        new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
    );
}

// Logs for one exercise on a given day, oldest first (so Set 1, 2, 3 read in
// the order you performed them).
export function todaysLogsForExercise(
  data: AppData,
  exerciseId: string,
  day: Date = new Date(),
): SetLog[] {
  return data.logs
    .filter(
      (l) =>
        l.exerciseId === exerciseId && isSameDay(new Date(l.loggedAt), day),
    )
    .sort(
      (a, b) =>
        new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
    );
}

// The most recent logged set for an exercise, used to pre-fill the logger with
// sensible defaults (your last working weight/reps/RIR).
export function lastLogForExercise(
  data: AppData,
  exerciseId: string,
): SetLog | undefined {
  return logsForExercise(data, exerciseId)[0];
}

// --- mutations: each returns a NEW AppData (never mutates the input) ---

export function addSet(
  data: AppData,
  input: Omit<SetLog, "id" | "loggedAt"> & { loggedAt?: string },
): AppData {
  const log: SetLog = {
    id: makeId(),
    loggedAt: input.loggedAt ?? new Date().toISOString(),
    exerciseId: input.exerciseId,
    weight: input.weight,
    reps: input.reps,
    rir: input.rir,
  };
  return { ...data, logs: [...data.logs, log] };
}

export function updateSet(
  data: AppData,
  id: string,
  patch: Partial<Pick<SetLog, "weight" | "reps" | "rir">>,
): AppData {
  return {
    ...data,
    logs: data.logs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
  };
}

export function deleteSet(data: AppData, id: string): AppData {
  return { ...data, logs: data.logs.filter((l) => l.id !== id) };
}
