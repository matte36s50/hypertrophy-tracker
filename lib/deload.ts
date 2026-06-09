import type { AppData, MuscleGroup, SetLog } from "./types";
import { setsByMuscle, startOfTrainingWeek, statusForSets } from "./volume";

// --- Deload detection ---
//
// Hypertrophy training accumulates fatigue faster than it builds muscle, so
// periodic deloads (one lighter week) let fatigue dissipate and keep the next
// block productive. We recommend a deload when EITHER:
//   - you've trained hard for many weeks in a row without a lighter week, OR
//   - one or more muscles have sat at/over MRV for several weeks running.
// A week with no logs — or far fewer sets than a working week — counts as a
// natural break and resets the streak.

// A completed week needs at least this many working sets to count as a "hard"
// training week (rather than a rest week or an already-light one).
const HARD_WEEK_MIN_SETS = 12;
// Train this many hard weeks in a row and a deload is due. Lines up with the
// usual 4–8 week mesocycle before a planned lighter week (RP / Israetel).
const MAX_HARD_WEEKS = 6;
// Muscles at/over MRV for at least this many weeks → fatigue-driven deload.
const FATIGUE_WEEKS = 2;

export interface DeloadAdvice {
  recommended: boolean;
  // Consecutive hard training weeks leading up to (but not including) this week.
  hardWeeks: number;
  // Muscles that have recently sat at or over MRV.
  fatiguedMuscles: MuscleGroup[];
  reason: string;
  guidance: string;
}

// The training-week start one week before the given one (DST-safe: we step the
// calendar date back 7 days and re-snap to Monday rather than subtracting ms).
function previousWeekStart(ts: number): number {
  const d = new Date(ts);
  d.setDate(d.getDate() - 7);
  return startOfTrainingWeek(d).getTime();
}

function totalSets(counts: Record<string, number>): number {
  return Object.values(counts).reduce((sum, n) => sum + n, 0);
}

export function deloadAdvice(data: AppData, now = new Date()): DeloadAdvice {
  const base: DeloadAdvice = {
    recommended: false,
    hardWeeks: 0,
    fatiguedMuscles: [],
    reason: "",
    guidance: "",
  };

  // Bucket every logged set by the start of the training week it belongs to.
  const byWeek = new Map<number, SetLog[]>();
  for (const log of data.logs) {
    const key = startOfTrainingWeek(new Date(log.loggedAt)).getTime();
    const bucket = byWeek.get(key);
    if (bucket) bucket.push(log);
    else byWeek.set(key, [log]);
  }

  // Walk backwards from the last COMPLETED week (the current week is still in
  // progress, so we don't judge its volume yet), counting consecutive hard
  // weeks and noting when volume sat at/over MRV.
  let cursor = previousWeekStart(startOfTrainingWeek(now).getTime());
  let hardWeeks = 0;
  let weeksWithFatigue = 0;
  const fatigued = new Set<MuscleGroup>();

  for (;;) {
    const logs = byWeek.get(cursor);
    if (!logs) break; // a week with no training → break in the streak
    const counts = setsByMuscle(logs);
    if (totalSets(counts) < HARD_WEEK_MIN_SETS) break; // a light week is itself a deload
    hardWeeks++;

    let fatiguedThisWeek = false;
    for (const [muscle, sets] of Object.entries(counts)) {
      const status = statusForSets(muscle as MuscleGroup, sets);
      if (status === "near-mrv" || status === "over-mrv") {
        fatigued.add(muscle as MuscleGroup);
        fatiguedThisWeek = true;
      }
    }
    if (fatiguedThisWeek) weeksWithFatigue++;

    cursor = previousWeekStart(cursor);
  }

  const byTime = hardWeeks >= MAX_HARD_WEEKS;
  const byFatigue = weeksWithFatigue >= FATIGUE_WEEKS;
  if (!byTime && !byFatigue) return { ...base, hardWeeks };

  const reason = byFatigue
    ? `Volume has sat at or above MRV for ${weeksWithFatigue} weeks running — fatigue is outpacing recovery.`
    : `You've trained hard for ${hardWeeks} weeks straight with no lighter week.`;

  return {
    recommended: true,
    hardWeeks,
    fatiguedMuscles: Array.from(fatigued),
    reason,
    guidance:
      "Take a deload: one easier week at roughly half your usual sets, stopping each set 2–3 reps shy of failure. Keep the same exercises, then start a fresh block.",
  };
}
