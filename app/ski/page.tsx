"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card, PageHeader, SectionLabel } from "@/components/ui";
import { IconChevron } from "@/components/icons";
import { SkiCalendar } from "@/components/ski/SkiCalendar";
import { PainSheet } from "@/components/ski/PainSheet";
import {
  PROGRAM_DAYS,
  clearFlag,
  dateForIndex,
  dayIndexFor,
  endProgram,
  exerciseIdsForDay,
  exerciseName,
  kneeModeOffStatus,
  morningIsWorse,
  moveSession,
  pendingMorningCheck,
  recordMorningPain,
  sessionOn,
  setKneeFriendly,
  shortDate,
  startProgram,
  strengthConflicts,
  toDateKey,
} from "@/lib/ski/program";
import { getSkiExercise } from "@/lib/ski/exercises";
import { DAY_KIND_LABELS, SKI_SESSIONS } from "@/lib/ski/sessions";
import type { ScheduleOption, SkiProgram } from "@/lib/ski/types";

export default function SkiPage() {
  const { data, update, ready } = useAppData();
  const program = data.ski;
  if (!ready) {
    return <p className="mt-6 text-center text-xs text-text-3">Loading…</p>;
  }
  return program ? (
    <ProgramView program={program} />
  ) : (
    <Setup onStart={(o, d) => update((prev) => startProgram(prev, o, d))} />
  );
}

function Setup({
  onStart,
}: {
  onStart: (option: ScheduleOption, startDate: string) => void;
}) {
  const [option, setOption] = useState<ScheduleOption>("B");
  const [start, setStart] = useState(toDateKey(new Date()));
  const opts: { key: ScheduleOption; title: string; body: string }[] = [
    {
      key: "B",
      title: "Option B · newer, returning or injured",
      body: "Two-week cycle × 3. Week 1: S1 · warm-up · P/C 1 · warm-up · S2 · warm-up · rest. Week 2: S3 · warm-up · P/C 2 · warm-up · Endurance · warm-up · rest.",
    },
    {
      key: "A",
      title: "Option A · experienced",
      body: "Every week: S1 · P/C 1 · S2 · rest/easy walk · S3 · P/C 2 · Endurance.",
    },
  ];
  return (
    <div>
      <PageHeader
        title="Pre-Ski Season"
        subtitle="6-week program · Carv pre-season plan by Katie White"
      />
      <SectionLabel>Schedule</SectionLabel>
      <div className="mb-4 flex flex-col gap-2.5">
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => setOption(o.key)}
            className={`press rounded-card border p-4 text-left ${
              option === o.key
                ? "border-accent bg-accent-soft"
                : "border-border bg-surface shadow-card"
            }`}
          >
            <div className="text-[15px] font-extrabold text-text">
              {o.title}
              {o.key === "B" && (
                <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-contrast">
                  Default
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[13px] font-medium leading-snug text-text-2">
              {o.body}
            </p>
          </button>
        ))}
      </div>
      <SectionLabel>Day 1</SectionLabel>
      <Card className="mb-4">
        <input
          type="date"
          value={start}
          onChange={(e) => e.target.value && setStart(e.target.value)}
          className="w-full rounded-input border border-border bg-surface-2 px-3 py-2.5 text-[15px] font-bold"
        />
        <p className="mt-2.5 text-[13px] font-medium text-text-2">
          Knee-friendly mode starts <b>on</b>: every jump and run is swapped for a
          low-impact version until your knee ratings stay low for two weeks.
        </p>
      </Card>
      <button
        type="button"
        onClick={() => onStart(option, start)}
        className="press flex h-[54px] w-full items-center justify-center rounded-btn bg-accent text-base font-bold text-accent-contrast shadow-card"
      >
        Start program
      </button>
    </div>
  );
}

function ProgramView({ program }: { program: SkiProgram }) {
  const { update } = useAppData();
  const router = useRouter();
  const today = toDateKey(new Date());
  const todayIndex = dayIndexFor(program, today);
  const [rearrange, setRearrange] = useState(false);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [morningOpen, setMorningOpen] = useState(false);

  const inProgram = todayIndex >= 0 && todayIndex < PROGRAM_DAYS;
  const kind = inProgram ? program.schedule[todayIndex] : null;
  const todayDone = inProgram && Boolean(sessionOn(program, today));
  const pending = pendingMorningCheck(program, today);
  const kneeOff = kneeModeOffStatus(program, today);
  const conflicts = strengthConflicts(program.schedule);
  const flags = Object.entries(program.flags);

  const subtitle =
    todayIndex < 0
      ? `Starts ${shortDate(program.startDate)} · in ${-todayIndex} day${todayIndex === -1 ? "" : "s"}`
      : inProgram
        ? `Week ${Math.floor(todayIndex / 7) + 1} · Day ${(todayIndex % 7) + 1} · Option ${program.option}`
        : "Program complete — have a great season";

  const pendingCandidates = pending
    ? exerciseIdsForDay(program, pending.dayKind).map((id) => ({
        id,
        name: exerciseName(id),
      }))
    : [];
  const loggedOnPending = new Set(
    program.logs.filter((l) => l.date === pending?.date).map((l) => l.exerciseId),
  );

  return (
    <div>
      <PageHeader title="Pre-Ski Season" subtitle={subtitle} />

      {pending && (
        <button
          type="button"
          onClick={() => setMorningOpen(true)}
          className="press mb-3 flex w-full items-center gap-3 rounded-card border border-warn bg-warn/10 p-4 text-left"
        >
          <span className="flex-1">
            <span className="block text-[15px] font-extrabold text-text">
              How&apos;s your knee this morning?
            </span>
            <span className="text-[13px] font-medium text-text-2">
              After {DAY_KIND_LABELS[pending.dayKind]} on {shortDate(pending.date)}
            </span>
          </span>
          <IconChevron s={16} />
        </button>
      )}

      {inProgram && kind && (
        <Card className="mb-3">
          <div className="text-[13px] font-bold uppercase tracking-[0.04em] text-accent-text">
            Today
          </div>
          <h2 className="mt-0.5 text-[22px] font-extrabold">
            {DAY_KIND_LABELS[kind]}
          </h2>
          <p className="mt-1 text-[13.5px] font-medium text-text-2">
            {kind === "rest"
              ? "Rest day — or an easy walk."
              : kind === "warmup-only"
                ? "Just the daily warm-up today (~15 min)."
                : `Warm-up, then ${SKI_SESSIONS[kind].focus.toLowerCase()}.`}
          </p>
          {kind !== "rest" && (
            <button
              type="button"
              onClick={() => router.push(`/ski/day/${todayIndex}`)}
              className={`press mt-3.5 flex h-[50px] w-full items-center justify-center rounded-btn text-base font-bold ${
                todayDone
                  ? "border border-accent bg-accent-soft text-accent-text"
                  : "bg-accent text-accent-contrast"
              }`}
            >
              {todayDone ? "Done ✓ · review session" : "Start session"}
            </button>
          )}
        </Card>
      )}

      <Card className="mb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[15px] font-extrabold">Knee-friendly mode</div>
            <p className="mt-0.5 text-[13px] font-medium leading-snug text-text-2">
              {program.kneeFriendly
                ? "On — jumps and runs swapped for low-impact versions."
                : "Off — full plyometric program."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={program.kneeFriendly}
            disabled={program.kneeFriendly && !kneeOff.eligible}
            onClick={() => update((d) => setKneeFriendly(d, !program.kneeFriendly))}
            className={`relative h-[30px] w-[52px] shrink-0 rounded-full transition-colors disabled:opacity-50 ${
              program.kneeFriendly ? "bg-accent" : "bg-surface-3"
            }`}
          >
            <span
              className={`absolute top-[3px] h-6 w-6 rounded-full bg-white shadow transition-[left] ${
                program.kneeFriendly ? "left-[25px]" : "left-[3px]"
              }`}
            />
          </button>
        </div>
        {program.kneeFriendly && (
          <p
            className={`mt-2.5 rounded-input px-3 py-2 text-[12.5px] font-semibold ${
              kneeOff.eligible
                ? "bg-accent-soft text-accent-text"
                : "bg-surface-2 text-text-3"
            }`}
          >
            {kneeOff.eligible
              ? `${kneeOff.reason} You can turn it off.`
              : `Locked on. ${kneeOff.reason}`}
          </p>
        )}
      </Card>

      {flags.length > 0 && (
        <Card className="mb-3">
          <SectionLabel>Flagged for your knee</SectionLabel>
          <div className="flex flex-col gap-2">
            {flags.map(([id, f]) => {
              const ex = getSkiExercise(id);
              return (
                <div key={id} className="rounded-row bg-warn/10 px-3.5 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-bold">{ex?.name ?? id}</span>
                    <button
                      type="button"
                      onClick={() => update((d) => clearFlag(d, id))}
                      className="text-[12.5px] font-bold text-text-3"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-[12.5px] font-medium text-text-2">{f.reason}</p>
                  <p className="mt-0.5 text-[12.5px] font-semibold text-warn-text">
                    {ex?.easier
                      ? `Next time: easier — ${ex.easier}`
                      : "No easier variant listed: go lighter or shorten the range."}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="mb-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[15px] font-extrabold">6-week plan</span>
          <button
            type="button"
            onClick={() => {
              setRearrange((r) => !r);
              setLastMove(null);
            }}
            className={`rounded-input border px-3 py-1.5 text-[12.5px] font-bold ${
              rearrange
                ? "border-accent bg-accent text-accent-contrast"
                : "border-border bg-surface-2 text-text-2"
            }`}
          >
            {rearrange ? "Done" : "Move sessions"}
          </button>
        </div>
        {rearrange && (
          <p className="mb-2.5 text-[12.5px] font-medium text-text-2">
            Drag a session onto another upcoming day, or tap one and then tap
            where it should go. The two days swap.
          </p>
        )}
        <SkiCalendar
          program={program}
          todayIndex={todayIndex}
          rearrange={rearrange}
          onOpenDay={(i) => program.schedule[i] !== "rest" && router.push(`/ski/day/${i}`)}
          onMove={(from, to) => {
            update((d) => moveSession(d, from, to));
            setLastMove([from, to]);
          }}
        />
        {conflicts.length > 0 && (
          <div className="mt-3 rounded-input bg-bad/10 px-3 py-2.5 text-[13px] font-semibold text-bad-text">
            ⚠ Strength sessions on consecutive days:{" "}
            {conflicts
              .map(
                ([a, b]) =>
                  `${shortDate(dateForIndex(program, a))}–${shortDate(dateForIndex(program, b))}`,
              )
              .join(", ")}
            . Leave a day between S1, S2 and S3.
            {lastMove && (
              <button
                type="button"
                onClick={() => {
                  update((d) => moveSession(d, lastMove[0], lastMove[1]));
                  setLastMove(null);
                }}
                className="ml-2 underline"
              >
                Undo last move
              </button>
            )}
          </div>
        )}
      </Card>

      <div className="mb-3 flex flex-col gap-2">
        <NavRow href="/ski/progress" label="Progress" hint="Calendar, knee pain, top sets" />
        <NavRow href="/ski/images" label="Exercise images" hint="Add your own demo photos" />
      </div>

      <button
        type="button"
        onClick={() => {
          if (confirm("End the pre-ski program? Its logs and knee ratings will be deleted.")) {
            update((d) => endProgram(d));
          }
        }}
        className="mt-2 w-full py-3 text-[13.5px] font-bold text-bad-text"
      >
        End program
      </button>

      {morningOpen && pending && (
        <PainSheet
          title="Knee check · this morning"
          prompt={`Knee pain this morning, after ${DAY_KIND_LABELS[pending.dayKind]} on ${shortDate(pending.date)}${
            pending.painDuring !== undefined ? ` (during: ${pending.painDuring}/10)` : ""
          }.`}
          candidates={pendingCandidates}
          defaultFlagged={pendingCandidates
            .map((c) => c.id)
            .filter((id) => getSkiExercise(id)?.kneeLoading && loggedOnPending.has(id))}
          needsFlags={(r) => morningIsWorse(pending, r)}
          flagPrompt="Worse than yesterday. Which exercises should get the easier variant next time?"
          onSave={(r, ids) => {
            update((d) => recordMorningPain(d, pending.id, r, ids));
            setMorningOpen(false);
          }}
          onClose={() => setMorningOpen(false)}
        />
      )}
    </div>
  );
}

function NavRow({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <Link
      href={href}
      className="press flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3.5 shadow-card"
    >
      <span>
        <span className="block text-[15px] font-extrabold">{label}</span>
        <span className="text-[12.5px] font-medium text-text-2">{hint}</span>
      </span>
      <IconChevron s={16} />
    </Link>
  );
}
