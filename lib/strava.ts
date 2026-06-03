// Strava integration: turn a finished workout into a structured strength
// activity (exercises + sets + reps + weight) and push it to Strava.
//
// Background: on 2026-05-21 Strava launched a dedicated strength-training
// experience. Their API now accepts a JSON file upload for WeightTraining
// activities whose `sets` array carries `{ exercise_type, repetitions, weight }`
// per set — exactly the data this app already records. We map our exercise ids
// to Strava's `exercise_type` enum so the workout shows up with real movement
// names and auto-populated muscle maps.
//
// Docs: https://developers.strava.com/docs/uploads/  (JSON upload format)
//
// NOTE: the `exercise_type` values below are best-effort SCREAMING_SNAKE_CASE
// mappings modelled on the documented examples (BARBELL_BENCH_PRESS,
// BARBELL_BACK_SQUAT, PLANK_GENERIC). Verify them against the official enum and
// adjust as needed — an unmapped exercise simply uploads its sets without a
// type (still counted as reps/weight, just without the muscle map).

import type { AppData, DayKey } from "./types";
import { getExercise } from "./exercises";
import { isSameDay } from "./logs";

// Map our internal exercise ids → Strava `exercise_type` enum values.
// Anything not listed uploads without an exercise_type (see buildStravaWorkout).
const STRAVA_EXERCISE_TYPE: Record<string, string> = {
  // chest
  "incline-db-press": "INCLINE_DUMBBELL_PRESS",
  "machine-chest-press": "MACHINE_CHEST_PRESS",
  "barbell-bench-press": "BARBELL_BENCH_PRESS",
  "pec-deck": "CABLE_FLY",
  // shoulders
  "db-shoulder-press": "DUMBBELL_SHOULDER_PRESS",
  "cable-lateral-raise": "CABLE_LATERAL_RAISE",
  "db-lateral-raise": "DUMBBELL_LATERAL_RAISE",
  "machine-lateral-raise": "MACHINE_LATERAL_RAISE",
  "reverse-pec-deck": "REAR_DELT_FLY",
  "cable-rear-delt-fly": "CABLE_REAR_DELT_FLY",
  // triceps
  "cable-pushdown": "TRICEPS_PUSHDOWN",
  "overhead-cable-ext": "OVERHEAD_TRICEPS_EXTENSION",
  "skull-crushers": "LYING_TRICEPS_EXTENSION",
  dips: "DIP",
  "close-grip-bench-press": "CLOSE_GRIP_BENCH_PRESS",
  // back
  "lat-pulldown": "LAT_PULLDOWN",
  "chest-supported-row": "CHEST_SUPPORTED_ROW",
  "pull-ups": "PULL_UP",
  "straight-arm-pulldown": "STRAIGHT_ARM_PULLDOWN",
  "db-pullover": "DUMBBELL_PULLOVER",
  "barbell-row": "BARBELL_ROW",
  // biceps
  "incline-db-curl": "INCLINE_DUMBBELL_CURL",
  "cable-curl": "CABLE_CURL",
  "ez-bar-curl": "EZ_BAR_CURL",
  "hammer-curl": "HAMMER_CURL",
  "preacher-curl": "PREACHER_CURL",
  // quads
  "hack-squat": "HACK_SQUAT",
  "leg-press": "LEG_PRESS",
  "barbell-squat": "BARBELL_BACK_SQUAT",
  "leg-extension": "LEG_EXTENSION",
  // hamstrings
  "seated-leg-curl": "SEATED_LEG_CURL",
  "romanian-deadlift": "ROMANIAN_DEADLIFT",
  "lying-leg-curl": "LYING_LEG_CURL",
  // glutes
  "hip-thrust": "BARBELL_HIP_THRUST",
  "cable-kickback": "GLUTE_KICKBACK",
  // calves
  "standing-calf-raise": "STANDING_CALF_RAISE",
  "seated-calf-raise": "SEATED_CALF_RAISE",
};

export function stravaExerciseType(exerciseId: string): string | undefined {
  return STRAVA_EXERCISE_TYPE[exerciseId];
}

// One set in Strava's JSON upload format.
export interface StravaSet {
  exercise_type?: string;
  repetitions: number;
  weight: number; // kilograms (Strava stores metric internally)
  start_time?: string; // ISO 8601
}

// The structured strength activity we upload as a JSON file.
export interface StravaWorkoutPayload {
  version: string;
  name: string;
  start_time: string; // ISO 8601 of the first set
  utc_offset: number; // seconds east of UTC
  elapsed_time: number; // seconds, first set → last set
  active_time: number; // seconds of working time (approx)
  sets: StravaSet[];
}

const LB_TO_KG = 0.45359237;

// Assemble a Strava strength-activity payload from the sets logged for one
// split day on a given calendar day. Returns null if nothing was logged.
export function buildStravaWorkout(
  data: AppData,
  dayKey: DayKey,
  dayLabel: string,
  day: Date = new Date(),
): StravaWorkoutPayload | null {
  // Every set logged on this calendar day, in the order performed.
  const logs = data.logs
    .filter((l) => isSameDay(new Date(l.loggedAt), day))
    .sort(
      (a, b) =>
        new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
    );
  if (logs.length === 0) return null;

  const toKg = (w: number) =>
    Math.round((data.unit === "lb" ? w * LB_TO_KG : w) * 100) / 100;

  const sets: StravaSet[] = logs.map((l) => {
    const type = stravaExerciseType(l.exerciseId);
    return {
      ...(type ? { exercise_type: type } : {}),
      repetitions: l.reps,
      weight: toKg(l.weight),
      start_time: new Date(l.loggedAt).toISOString(),
    };
  });

  const first = new Date(logs[0].loggedAt);
  const last = new Date(logs[logs.length - 1].loggedAt);
  // Elapsed spans first → last set; if only one set, fall back to a nominal
  // minute so Strava doesn't reject a zero-length activity.
  const elapsed = Math.max(60, Math.round((last.getTime() - first.getTime()) / 1000));
  // Rough working time: ~45s per set, capped at the elapsed span.
  const active = Math.min(elapsed, logs.length * 45);

  return {
    version: "1.0",
    name: `${dayLabel} Day`,
    start_time: first.toISOString(),
    utc_offset: -first.getTimezoneOffset() * 60,
    elapsed_time: elapsed,
    active_time: active,
    sets,
  };
}

// --- client helpers (browser) -------------------------------------------------

export interface StravaStatus {
  // Whether the deployment has Strava credentials set (env vars).
  configured?: boolean;
  connected: boolean;
  athlete?: string;
}

// Whether the browser is currently linked to a Strava account.
export async function getStravaStatus(): Promise<StravaStatus> {
  try {
    const res = await fetch("/api/strava/status", { cache: "no-store" });
    if (!res.ok) return { connected: false };
    return (await res.json()) as StravaStatus;
  } catch {
    return { connected: false };
  }
}

// Kick off the OAuth flow. After authorising, Strava returns to /api/strava/
// callback which sets the cookie and redirects back to the app.
export function connectStrava(): void {
  window.location.href = "/api/strava/authorize";
}

export async function disconnectStrava(): Promise<void> {
  await fetch("/api/strava/disconnect", { method: "POST" });
}

export interface ShareResult {
  ok: boolean;
  activityId?: number;
  error?: string;
}

// Upload a built workout payload to Strava via our server route.
export async function shareWorkoutToStrava(
  payload: StravaWorkoutPayload,
): Promise<ShareResult> {
  try {
    const res = await fetch("/api/strava/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as ShareResult & {
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, error: json.error ?? `Upload failed (${res.status})` };
    }
    return { ok: true, activityId: json.activityId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}
