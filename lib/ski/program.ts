import type { AppData } from "../types";
import { makeId } from "../logs";
import { getSkiExercise } from "./exercises";
import { sessionsForDay } from "./sessions";
import type {
  ScheduleOption,
  SkiDayKind,
  SkiItemPlan,
  SkiProgram,
  SkiSessionItem,
  SkiSessionRecord,
  SkiSetLog,
  SkiVariant,
} from "./types";

export const PROGRAM_DAYS = 42;
export const PROGRAM_WEEKS = 6;

// ---- dates (local calendar days as YYYY-MM-DD) ----

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, n: number): string {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + n);
  return toDateKey(d);
}

// Whole days from a to b (b - a), DST-safe.
export function daysBetween(a: string, b: string): number {
  const ua = Date.UTC(...(a.split("-").map(Number) as [number, number, number]));
  const ub = Date.UTC(...(b.split("-").map(Number) as [number, number, number]));
  return Math.round((ub - ua) / 86_400_000);
}

export function shortDate(key: string): string {
  return fromDateKey(key).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ---- schedule ----

const OPTION_A_WEEK: SkiDayKind[] = ["s1", "pc1", "s2", "rest", "s3", "pc2", "endurance"];
const OPTION_B_WEEK1: SkiDayKind[] = ["s1", "warmup-only", "pc1", "warmup-only", "s2", "warmup-only", "rest"];
// "Same pattern" as week 1 with the next three sessions in program order.
const OPTION_B_WEEK2: SkiDayKind[] = ["s3", "warmup-only", "pc2", "warmup-only", "endurance", "warmup-only", "rest"];

export function buildSchedule(option: ScheduleOption): SkiDayKind[] {
  if (option === "A") {
    return Array.from({ length: PROGRAM_WEEKS }, () => OPTION_A_WEEK).flat();
  }
  return Array.from({ length: PROGRAM_WEEKS / 2 }, () => [
    ...OPTION_B_WEEK1,
    ...OPTION_B_WEEK2,
  ]).flat();
}

export function startProgram(
  data: AppData,
  option: ScheduleOption,
  startDate: string,
): AppData {
  const ski: SkiProgram = {
    startDate,
    option,
    schedule: buildSchedule(option),
    kneeFriendly: true,
    variants: {},
    flags: {},
    logs: [],
    sessions: [],
  };
  return { ...data, ski };
}

export function endProgram(data: AppData): AppData {
  return { ...data, ski: null };
}

export function dayIndexFor(program: SkiProgram, date: string): number {
  return daysBetween(program.startDate, date);
}

export function dateForIndex(program: SkiProgram, index: number): string {
  return addDays(program.startDate, index);
}

export function dayKindOn(program: SkiProgram, date: string): SkiDayKind | null {
  const i = dayIndexFor(program, date);
  if (i < 0 || i >= PROGRAM_DAYS) return null;
  return program.schedule[i];
}

export const isStrength = (k: SkiDayKind) =>
  k === "s1" || k === "s2" || k === "s3";

// Pairs of consecutive day indices that both hold a Strength session.
export function strengthConflicts(schedule: SkiDayKind[]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < schedule.length - 1; i++) {
    if (isStrength(schedule[i]) && isStrength(schedule[i + 1])) {
      out.push([i, i + 1]);
    }
  }
  return out;
}

// Swap what's planned on two days (the "drag a session to another day" move).
export function moveSession(
  data: AppData,
  from: number,
  to: number,
): AppData {
  const p = data.ski;
  if (!p || from === to) return data;
  const schedule = [...p.schedule];
  [schedule[from], schedule[to]] = [schedule[to], schedule[from]];
  return { ...data, ski: { ...p, schedule } };
}

// ---- items ----

// The plan actually used for an item today: the knee-friendly substitute when
// knee mode is on and the item has one.
export function effectivePlan(
  program: SkiProgram,
  item: SkiSessionItem,
): { plan: SkiItemPlan; replaced: boolean } {
  if (program.kneeFriendly && item.kneeSub) {
    return { plan: item.kneeSub, replaced: true };
  }
  return { plan: item, replaced: false };
}

// Exercise ids done on a given day kind (after knee substitution).
export function exerciseIdsForDay(
  program: SkiProgram,
  kind: SkiDayKind,
): string[] {
  const ids: string[] = [];
  for (const s of sessionsForDay(kind)) {
    for (const item of s.items) {
      const id = effectivePlan(program, item).plan.exerciseId;
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

// ---- logs ----

// Tag on warm-up check-off logs, so they never count as (or prefill) sets.
export const WARMUP_TAG = "warmup";

export function logsFor(
  program: SkiProgram,
  exerciseId: string,
  date: string,
): SkiSetLog[] {
  return program.logs
    .filter((l) => l.exerciseId === exerciseId && l.date === date)
    .sort((a, b) => a.loggedAt.localeCompare(b.loggedAt));
}

// Most recent log for an exercise before (or on) a date, for prefill.
export function lastLogFor(
  program: SkiProgram,
  exerciseId: string,
  beforeOrOn?: string,
): SkiSetLog | undefined {
  let best: SkiSetLog | undefined;
  for (const l of program.logs) {
    if (l.exerciseId !== exerciseId || l.tag === WARMUP_TAG) continue;
    if (beforeOrOn && l.date > beforeOrOn) continue;
    if (!best || l.loggedAt > best.loggedAt) best = l;
  }
  return best;
}

function withProgram(data: AppData, fn: (p: SkiProgram) => SkiProgram): AppData {
  return data.ski ? { ...data, ski: fn(data.ski) } : data;
}

export function addSkiLog(
  data: AppData,
  log: Omit<SkiSetLog, "id" | "loggedAt">,
): AppData {
  return withProgram(data, (p) => ({
    ...p,
    logs: [...p.logs, { ...log, id: makeId(), loggedAt: new Date().toISOString() }],
  }));
}

export function updateSkiLog(
  data: AppData,
  id: string,
  patch: Partial<Pick<SkiSetLog, "weight" | "reps" | "minutes" | "modality">>,
): AppData {
  return withProgram(data, (p) => ({
    ...p,
    logs: p.logs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
  }));
}

export function deleteSkiLog(data: AppData, id: string): AppData {
  return withProgram(data, (p) => ({
    ...p,
    logs: p.logs.filter((l) => l.id !== id),
  }));
}

export function setVariant(
  data: AppData,
  exerciseId: string,
  variant: SkiVariant | null,
): AppData {
  return withProgram(data, (p) => {
    const variants = { ...p.variants };
    if (variant) variants[exerciseId] = variant;
    else delete variants[exerciseId];
    return { ...p, variants };
  });
}

export function setKneeFriendly(data: AppData, on: boolean): AppData {
  return withProgram(data, (p) => ({ ...p, kneeFriendly: on }));
}

// ---- sessions ----

export function sessionOn(
  program: SkiProgram,
  date: string,
): SkiSessionRecord | undefined {
  return program.sessions.find((s) => s.date === date);
}

// Stamp (or refresh) the session for a day with its during-session knee pain,
// then apply the pain rules. Idempotent per date.
export function finishSkiSession(
  data: AppData,
  date: string,
  painDuring: number,
  flaggedIds: string[],
): AppData {
  return withProgram(data, (p) => {
    const kind = dayKindOn(p, date) ?? "warmup-only";
    const existing = sessionOn(p, date);
    const sessions = existing
      ? p.sessions.map((s) =>
          s.id === existing.id ? { ...s, painDuring, dayKind: kind } : s,
        )
      : [
          ...p.sessions,
          {
            id: makeId(),
            date,
            dayKind: kind,
            finishedAt: new Date().toISOString(),
            painDuring,
          },
        ];
    const flags = { ...p.flags };
    if (painDuring > PAIN_DURING_LIMIT) {
      for (const id of flaggedIds) {
        flags[id] = {
          reason: `Knee pain ${painDuring}/10 during the session on ${shortDate(date)}`,
          at: date,
        };
      }
    }
    return { ...p, sessions, flags };
  });
}

// ---- knee rules ----

// Pain above this during exercise flags the exercise.
export const PAIN_DURING_LIMIT = 3;
// All ratings must be at or below this for two weeks to offer knee mode OFF.
export const PAIN_CLEAR_LIMIT = 2;

// A finished session that still needs its next-morning rating, once that
// morning has arrived.
export function pendingMorningCheck(
  program: SkiProgram,
  today: string,
): SkiSessionRecord | undefined {
  return [...program.sessions]
    .filter((s) => s.painMorning === undefined && s.date < today)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
}

// The morning is "worse than the day before" when it's higher than the
// during-session rating from the training day.
export function morningIsWorse(session: SkiSessionRecord, morning: number) {
  return session.painDuring !== undefined && morning > session.painDuring;
}

// Record the next-morning rating. If it's worse than the day before, flag the
// chosen exercises. If it isn't and the session itself was comfortable, clear
// earlier flags on exercises done that day (the easier variant worked).
export function recordMorningPain(
  data: AppData,
  sessionId: string,
  morning: number,
  flaggedIds: string[],
): AppData {
  return withProgram(data, (p) => {
    const session = p.sessions.find((s) => s.id === sessionId);
    if (!session) return p;
    const sessions = p.sessions.map((s) =>
      s.id === sessionId
        ? { ...s, painMorning: morning, painMorningAt: new Date().toISOString() }
        : s,
    );
    const flags = { ...p.flags };
    if (morningIsWorse(session, morning)) {
      for (const id of flaggedIds) {
        flags[id] = {
          reason: `Knee worse the morning after ${shortDate(session.date)} (${session.painDuring} → ${morning}/10)`,
          at: session.date,
        };
      }
    } else if ((session.painDuring ?? 0) <= PAIN_DURING_LIMIT) {
      const done = new Set(
        p.logs.filter((l) => l.date === session.date).map((l) => l.exerciseId),
      );
      for (const id of Object.keys(flags)) {
        if (done.has(id) && flags[id].at < session.date) delete flags[id];
      }
    }
    return { ...p, sessions, flags };
  });
}

export function clearFlag(data: AppData, exerciseId: string): AppData {
  return withProgram(data, (p) => {
    const flags = { ...p.flags };
    delete flags[exerciseId];
    return { ...p, flags };
  });
}

export interface PainPoint {
  date: string; // the calendar day the pain was felt
  value: number;
  kind: "during" | "morning";
}

export function painPoints(program: SkiProgram): PainPoint[] {
  const pts: PainPoint[] = [];
  for (const s of program.sessions) {
    if (s.painDuring !== undefined)
      pts.push({ date: s.date, value: s.painDuring, kind: "during" });
    if (s.painMorning !== undefined)
      pts.push({ date: addDays(s.date, 1), value: s.painMorning, kind: "morning" });
  }
  return pts.sort((a, b) => a.date.localeCompare(b.date));
}

// Knee-friendly mode may only be turned OFF after two consecutive weeks where
// every rating is ≤ 2 — with at least one rating in each of those weeks.
export function kneeModeOffStatus(
  program: SkiProgram,
  today: string,
): { eligible: boolean; reason: string } {
  const pts = painPoints(program);
  const windowStart = addDays(today, -13);
  const midpoint = addDays(today, -6);
  const inWindow = pts.filter((p) => p.date >= windowStart && p.date <= today);
  const week1 = inWindow.filter((p) => p.date < midpoint);
  const week2 = inWindow.filter((p) => p.date >= midpoint);
  const worst = Math.max(-1, ...inWindow.map((p) => p.value));
  if (week1.length === 0 || week2.length === 0) {
    return {
      eligible: false,
      reason: "Needs knee ratings in each of the last two weeks.",
    };
  }
  if (worst > PAIN_CLEAR_LIMIT) {
    return {
      eligible: false,
      reason: `A rating in the last two weeks was ${worst}/10 — all need to be ≤${PAIN_CLEAR_LIMIT}.`,
    };
  }
  return {
    eligible: true,
    reason: `Every knee rating for two weeks has been ≤${PAIN_CLEAR_LIMIT}/10.`,
  };
}

// ---- progress ----

// Heaviest set per session date for one exercise, oldest → newest.
export function topSetSeries(
  program: SkiProgram,
  exerciseId: string,
): { date: string; weight: number }[] {
  const byDate = new Map<string, number>();
  for (const l of program.logs) {
    if (l.exerciseId !== exerciseId || l.weight <= 0 || l.tag === WARMUP_TAG)
      continue;
    byDate.set(l.date, Math.max(byDate.get(l.date) ?? 0, l.weight));
  }
  return Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, weight]) => ({ date, weight }));
}

export function exerciseName(id: string): string {
  return getSkiExercise(id)?.name ?? id;
}
