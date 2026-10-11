// Types for the 6-week Pre-Ski Season program. This lives alongside (not
// inside) the hypertrophy split: it has its own exercises, logs and sessions,
// so nothing here feeds the RP volume or double-progression logic.

// The seven session types. The warm-up runs before every other session.
export type SkiSessionKey =
  | "warmup"
  | "s1"
  | "s2"
  | "s3"
  | "pc1"
  | "pc2"
  | "endurance";

// What a single calendar day holds in the 6-week schedule.
export type SkiDayKind =
  | Exclude<SkiSessionKey, "warmup">
  | "warmup-only"
  | "rest";

// A = experienced (weekly), B = newer / returning / injured (2-week cycle).
export type ScheduleOption = "A" | "B";

export type SkiEquipment =
  | "bodyweight"
  | "dumbbell"
  | "kettlebell"
  | "barbell"
  | "landmine"
  | "plate"
  | "step"
  | "box"
  | "mat"
  | "band"
  | "cable"
  | "med-ball"
  | "ladder"
  | "support"
  | "cardio";

// How a movement is logged.
//  check     — tick it off (warm-up drills)
//  reps      — bodyweight reps per set
//  load      — weight × reps per set
//  height    — box height × reps per set
//  timed     — run the interval timer, tick each set
//  intervals — run/bike/rower interval block, logged once with modality
//  cardio    — minutes + modality (zone 2)
//  ladder    — agility ladder pattern checklist
export type SkiTracking =
  | "check"
  | "reps"
  | "load"
  | "height"
  | "timed"
  | "intervals"
  | "cardio"
  | "ladder";

export type SkiVariant = "easier" | "harder";

// Where an exercise's demo image came from (for the attribution report).
export interface ImageSource {
  dataset: "free-exercise-db" | "wger";
  // The dataset's exercise id.
  id: string;
  // The dataset's exercise name.
  name: string;
  // "exact" = same movement; "similar" = same pattern with a different
  // implement or a missing detail (e.g. two-hand swing vs one-arm).
  match: "exact" | "similar";
  // Credit for images whose license requires attribution (wger, CC BY-SA).
  credit?: {
    author: string;
    license: { name: string; url: string };
    sourceUrl: string;
  };
}

export interface SkiExercise {
  id: string;
  name: string;
  // Short coaching cue.
  cue: string;
  equipment: SkiEquipment[];
  // Load description, e.g. "heavy", "moderate KB", "bodyweight".
  load: string;
  // Default logging mode (a session item can override it, e.g. warm-up = check).
  tracking: SkiTracking;
  // Label for the rep count when it isn't "reps" (e.g. "lengths").
  repsLabel?: string;
  // Label for the load field when it isn't weight (e.g. "Box height").
  loadLabel?: string;
  perSide?: boolean;
  // Impact/plyometric — replaced in knee-friendly mode.
  plyo?: boolean;
  // Loads the knee meaningfully; pre-selected when a next-morning flare
  // asks which exercises to flag.
  kneeLoading?: boolean;
  easier?: string;
  harder?: string;
  // 1–2 images (start / end position), served from /public.
  imageUrls: string[];
  videoUrl: string;
  imageSource?: ImageSource;
}

// One step of an interval timer.
export interface IntervalPhase {
  label: string;
  seconds: number;
  kind: "work" | "rest" | "easy";
}

export interface IntervalSpec {
  name: string;
  phases: IntervalPhase[];
}

// The prescription for one exercise inside a session.
export interface SkiItemPlan {
  exerciseId: string;
  sets: number;
  prescription: string;
  // Reps to prefill when there's no history.
  repTarget?: number;
  timer?: IntervalSpec;
  // Overrides the exercise's default tracking for this slot.
  track?: SkiTracking;
}

export interface SkiSessionItem extends SkiItemPlan {
  // Low-impact replacement used when knee-friendly mode is on.
  kneeSub?: SkiItemPlan;
}

export interface SkiSessionDef {
  key: SkiSessionKey;
  label: string;
  short: string;
  focus: string;
  items: SkiSessionItem[];
}

// ---- persisted ----

export interface SkiSetLog {
  id: string;
  exerciseId: string;
  // Local calendar day the set belongs to (YYYY-MM-DD).
  date: string;
  weight: number;
  reps: number;
  variant?: SkiVariant;
  // Interval / cardio modality ("run", "bike", "rower", …).
  modality?: string;
  minutes?: number;
  // Free tag, e.g. the agility-ladder pattern id.
  tag?: string;
  loggedAt: string;
}

export interface SkiSessionRecord {
  id: string;
  date: string;
  dayKind: SkiDayKind;
  finishedAt: string;
  // 0–10 knee pain during the session.
  painDuring?: number;
  // 0–10 knee pain the morning after.
  painMorning?: number;
  painMorningAt?: string;
}

export interface SkiFlag {
  reason: string;
  at: string;
}

export interface SkiProgram {
  // Day 1 of the program (YYYY-MM-DD, local).
  startDate: string;
  option: ScheduleOption;
  // 42 entries, one per program day. Users can move sessions around.
  schedule: SkiDayKind[];
  kneeFriendly: boolean;
  // Remembered easier/harder choice per exercise.
  variants: Record<string, SkiVariant>;
  // Exercises flagged by the knee-pain rules.
  flags: Record<string, SkiFlag>;
  logs: SkiSetLog[];
  sessions: SkiSessionRecord[];
}
