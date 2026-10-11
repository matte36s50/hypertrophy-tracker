import type {
  IntervalPhase,
  IntervalSpec,
  SkiDayKind,
  SkiSessionDef,
  SkiSessionKey,
} from "./types";

// ---- interval timers ----

function repeat(n: number, block: IntervalPhase[]): IntervalPhase[] {
  const out: IntervalPhase[] = [];
  for (let i = 0; i < n; i++) {
    for (const p of block) {
      // Drop the trailing rest after the final round.
      if (i === n - 1 && p === block[block.length - 1] && p.kind === "rest")
        continue;
      out.push({ ...p, label: `${p.label} · ${i + 1}/${n}` });
    }
  }
  return out;
}

export const HOLLOW_TIMER: IntervalSpec = {
  name: "Hollow body hold · 20s on / 10s off × 8",
  phases: repeat(8, [
    { label: "Hold", seconds: 20, kind: "work" },
    { label: "Rest", seconds: 10, kind: "rest" },
  ]),
};

export const POGO_TIMER: IntervalSpec = {
  name: "Pogo jumps · 30s both, 30s each leg",
  phases: [
    { label: "Both feet", seconds: 30, kind: "work" },
    { label: "Switch", seconds: 5, kind: "rest" },
    { label: "Left leg", seconds: 30, kind: "work" },
    { label: "Switch", seconds: 5, kind: "rest" },
    { label: "Right leg", seconds: 30, kind: "work" },
  ],
};

// Rest between rounds isn't in the source plan; 10s to switch sides and 30s
// between rounds is our default.
export const LATERAL_HOPS_TIMER: IntervalSpec = {
  name: "Lateral single-leg hops · 6 × 20s each side",
  phases: repeat(6, [
    { label: "Left leg", seconds: 20, kind: "work" },
    { label: "Switch", seconds: 10, kind: "rest" },
    { label: "Right leg", seconds: 20, kind: "work" },
    { label: "Rest", seconds: 30, kind: "rest" },
  ]),
};

export function sprintTimer(mode: string): IntervalSpec {
  return {
    name: `Sprint intervals (${mode}) · 10 × 40s / 20s`,
    phases: [
      { label: "Easy warm-up", seconds: 300, kind: "easy" },
      ...repeat(10, [
        { label: "Hard", seconds: 40, kind: "work" },
        { label: "Recover", seconds: 20, kind: "rest" },
      ]),
      { label: "Recover", seconds: 20, kind: "rest" },
      { label: "Easy cool-down", seconds: 300, kind: "easy" },
    ],
  };
}

export function conditioningTimer(mode: string): IntervalSpec {
  return {
    name: `Conditioning (${mode}) · 10 × 1 min hard / 1 min easy`,
    phases: [
      { label: "Easy warm-up", seconds: 600, kind: "easy" },
      ...repeat(10, [
        { label: "Hard ~80%", seconds: 60, kind: "work" },
        { label: "Easy", seconds: 60, kind: "rest" },
      ]),
      { label: "Easy", seconds: 60, kind: "rest" },
    ],
  };
}

export function timerSeconds(spec: IntervalSpec): number {
  return spec.phases.reduce((s, p) => s + p.seconds, 0);
}

// ---- sessions ----
// Knee-friendly substitutes keep the original sets × reps unless the original
// was time-based.

export const SKI_SESSIONS: Record<SkiSessionKey, SkiSessionDef> = {
  warmup: {
    key: "warmup",
    label: "Daily Warm-up",
    short: "Warm-up",
    focus: "Mobility, trunk control and landing prep — before every session",
    items: [
      { exerciseId: "pelvic-tilt", sets: 1, prescription: "1 × 10–15", repTarget: 12, track: "check" },
      { exerciseId: "dead-bug", sets: 1, prescription: "1 × 10–15 each side", repTarget: 12, track: "check" },
      { exerciseId: "bird-dog", sets: 1, prescription: "1 × 10–15 each side", repTarget: 12, track: "check" },
      { exerciseId: "tspine-rotation", sets: 1, prescription: "1 × 10–15 each side", repTarget: 12, track: "check" },
      { exerciseId: "ninety-ninety-hip-lift", sets: 1, prescription: "1 × 8–10 each side", repTarget: 8, track: "check" },
      { exerciseId: "ankle-dorsiflexion", sets: 1, prescription: "1 × 10–15 each side", repTarget: 12, track: "check" },
      { exerciseId: "worlds-greatest-stretch", sets: 1, prescription: "1 × 8–10 each side", repTarget: 8, track: "check" },
      { exerciseId: "calf-raise-bw", sets: 1, prescription: "1 × 15–20", repTarget: 15, track: "check" },
      { exerciseId: "standing-hip-circles", sets: 1, prescription: "1 × 25 each side", repTarget: 25, track: "check" },
      { exerciseId: "lateral-to-curtsy-lunge", sets: 1, prescription: "1 × 10–12 each side", repTarget: 10, track: "check" },
      { exerciseId: "plank-shoulder-taps", sets: 1, prescription: "1 × 10–12 each side", repTarget: 10, track: "check" },
      {
        exerciseId: "pogo-jumps",
        sets: 1,
        prescription: "30s both feet, then 30s each leg",
        track: "check",
        timer: POGO_TIMER,
        kneeSub: { exerciseId: "ko-calf-raise-tempo", sets: 1, prescription: "1 × 15, 3s lower", repTarget: 15, track: "check" },
      },
      {
        exerciseId: "broad-jump-backpedal",
        sets: 1,
        prescription: "4 × 4",
        repTarget: 4,
        track: "check",
        kneeSub: { exerciseId: "ko-goblet-box-squat", sets: 1, prescription: "4 × 4, 3s lower (light)", repTarget: 4, track: "check" },
      },
      {
        exerciseId: "depth-drop",
        sets: 1,
        prescription: "1 × 8",
        repTarget: 8,
        track: "check",
        kneeSub: { exerciseId: "ko-step-down", sets: 1, prescription: "1 × 8, 3s lower, hold landing", repTarget: 8, track: "check" },
      },
    ],
  },
  s1: {
    key: "s1",
    label: "Strength 1",
    short: "S1",
    focus: "Full body, single-leg focus",
    items: [
      { exerciseId: "goblet-squat", sets: 4, prescription: "4 × 6", repTarget: 6 },
      { exerciseId: "kb-suitcase-carry", sets: 4, prescription: "4 × 1 length each side", repTarget: 1 },
      { exerciseId: "kb-lateral-lunge", sets: 3, prescription: "3 × 8 each side", repTarget: 8 },
      { exerciseId: "kb-single-arm-row", sets: 3, prescription: "3 × 8 each side", repTarget: 8 },
      { exerciseId: "db-step-up", sets: 4, prescription: "4 × 6 each side", repTarget: 6 },
      { exerciseId: "sa-db-overhead-press", sets: 4, prescription: "4 × 8 each side", repTarget: 8 },
      { exerciseId: "hollow-body-hold", sets: 1, prescription: "8 rounds · 20s on / 10s off", timer: HOLLOW_TIMER },
      { exerciseId: "half-kneeling-landmine-press", sets: 3, prescription: "3 × 10 each side", repTarget: 10 },
    ],
  },
  s2: {
    key: "s2",
    label: "Strength 2",
    short: "S2",
    focus: "Glutes, hamstrings, core",
    items: [
      { exerciseId: "pallof-press", sets: 3, prescription: "3 × 12 each side", repTarget: 12 },
      { exerciseId: "plank-plate-pull-through", sets: 3, prescription: "3 × 8 each side", repTarget: 8 },
      { exerciseId: "deadlift", sets: 5, prescription: "5 × 5", repTarget: 5 },
      { exerciseId: "dead-bug", sets: 5, prescription: "5 × 10 each side", repTarget: 10 },
      { exerciseId: "single-leg-rdl", sets: 4, prescription: "4 × 8 each side", repTarget: 8 },
      { exerciseId: "db-biceps-curl", sets: 4, prescription: "4 × 10", repTarget: 10 },
      { exerciseId: "bulgarian-split-squat", sets: 4, prescription: "4 × 8 each side", repTarget: 8 },
      { exerciseId: "copenhagen-plank", sets: 4, prescription: "4 × 8 each side", repTarget: 8 },
    ],
  },
  s3: {
    key: "s3",
    label: "Strength 3",
    short: "S3",
    focus: "Single-leg, knee/ankle control, upper-body stability",
    items: [
      { exerciseId: "back-rack-reverse-lunge", sets: 4, prescription: "4 × 6 each side", repTarget: 6 },
      { exerciseId: "kb-waiters-carry", sets: 4, prescription: "4 × 1 length each side", repTarget: 1 },
      { exerciseId: "barbell-rdl", sets: 4, prescription: "4 × 8", repTarget: 8 },
      { exerciseId: "db-lateral-raise", sets: 4, prescription: "4 × 8", repTarget: 8 },
      { exerciseId: "poliquin-step-down", sets: 3, prescription: "3 × 8 each side", repTarget: 8 },
      { exerciseId: "calf-raise-kb", sets: 3, prescription: "3 × 10", repTarget: 10 },
      { exerciseId: "landmine-curtsy-lunge", sets: 3, prescription: "3 × 6–10 each side", repTarget: 8 },
      { exerciseId: "push-ups", sets: 3, prescription: "3 × 10", repTarget: 10 },
    ],
  },
  pc1: {
    key: "pc1",
    label: "Power / Conditioning 1",
    short: "P/C 1",
    focus: "Plyometrics, then sprint intervals",
    items: [
      {
        exerciseId: "depth-drop-vertical",
        sets: 6,
        prescription: "6 × 3",
        repTarget: 3,
        kneeSub: { exerciseId: "ko-step-down", sets: 6, prescription: "6 × 3 each side, 3s lower, hold landing", repTarget: 3 },
      },
      {
        exerciseId: "single-leg-broad-jump",
        sets: 6,
        prescription: "6 × 3 each side",
        repTarget: 3,
        kneeSub: { exerciseId: "ko-goblet-box-squat", sets: 6, prescription: "6 × 3, 3s lower", repTarget: 3 },
      },
      {
        exerciseId: "box-jump",
        sets: 6,
        prescription: "6 × 4 · log box height",
        repTarget: 4,
        kneeSub: { exerciseId: "ko-bw-step-up", sets: 6, prescription: "6 × 4 each side, controlled", repTarget: 4 },
      },
      {
        exerciseId: "lateral-sl-hops",
        sets: 6,
        prescription: "6 × 20s each side",
        timer: LATERAL_HOPS_TIMER,
        kneeSub: { exerciseId: "ko-lateral-band-walk", sets: 6, prescription: "6 × 10 steps each way", repTarget: 10 },
      },
      {
        exerciseId: "sprint-intervals",
        sets: 1,
        prescription: "5 min jog → 10 × (40s hard / 20s recover) → 5 min jog",
        timer: sprintTimer("run"),
        kneeSub: { exerciseId: "ko-bike-intervals", sets: 1, prescription: "5 min easy → 10 × (40s hard / 20s recover) → 5 min easy", timer: sprintTimer("bike/rower") },
      },
    ],
  },
  pc2: {
    key: "pc2",
    label: "Power / Conditioning 2",
    short: "P/C 2",
    focus: "Power, then conditioning intervals",
    items: [
      {
        exerciseId: "broad-to-vertical",
        sets: 4,
        prescription: "4 × 4",
        repTarget: 4,
        kneeSub: { exerciseId: "ko-goblet-box-squat", sets: 4, prescription: "4 × 4, 3s lower", repTarget: 4 },
      },
      {
        exerciseId: "squat-jump",
        sets: 4,
        prescription: "4 × 10",
        repTarget: 10,
        kneeSub: { exerciseId: "ko-bw-step-up", sets: 4, prescription: "4 × 10 each side, controlled", repTarget: 10 },
      },
      { exerciseId: "lateral-med-ball-toss", sets: 4, prescription: "4 × 8 each side", repTarget: 8 },
      { exerciseId: "kb-swing", sets: 4, prescription: "4 × 10", repTarget: 10 },
      {
        exerciseId: "conditioning-intervals",
        sets: 1,
        prescription: "10 min jog → 10 × (1 min hard ~80% / 1 min easy)",
        timer: conditioningTimer("run"),
        kneeSub: { exerciseId: "ko-bike-intervals", sets: 1, prescription: "10 min easy → 10 × (1 min hard ~80% / 1 min easy)", timer: conditioningTimer("bike/rower") },
      },
    ],
  },
  endurance: {
    key: "endurance",
    label: "Endurance",
    short: "Endur.",
    focus: "Footwork, then a long zone 2 effort",
    items: [
      { exerciseId: "agility-ladder", sets: 1, prescription: "9 patterns, both sides where relevant" },
      { exerciseId: "zone2", sets: 1, prescription: "30–45 min steady, conversational pace" },
    ],
  },
};

// Sessions to run on a given day, in order (warm-up first).
export function sessionsForDay(kind: SkiDayKind): SkiSessionDef[] {
  if (kind === "rest") return [];
  if (kind === "warmup-only") return [SKI_SESSIONS.warmup];
  return [SKI_SESSIONS.warmup, SKI_SESSIONS[kind]];
}

export const DAY_KIND_LABELS: Record<SkiDayKind, string> = {
  s1: "Strength 1",
  s2: "Strength 2",
  s3: "Strength 3",
  pc1: "Power / Cond. 1",
  pc2: "Power / Cond. 2",
  endurance: "Endurance",
  "warmup-only": "Warm-up only",
  rest: "Rest",
};

export const DAY_KIND_SHORT: Record<SkiDayKind, string> = {
  s1: "S1",
  s2: "S2",
  s3: "S3",
  pc1: "P/C1",
  pc2: "P/C2",
  endurance: "End.",
  "warmup-only": "W/U",
  rest: "Rest",
};
