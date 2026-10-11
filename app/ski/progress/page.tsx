"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppData } from "@/components/DataProvider";
import { Card, PageHeader, SectionLabel, formatWeight } from "@/components/ui";
import { LineChart } from "@/components/LineChart";
import { IconChevron } from "@/components/icons";
import { SkiCalendar } from "@/components/ski/SkiCalendar";
import { PainChart } from "@/components/ski/PainChart";
import {
  PROGRAM_DAYS,
  dayIndexFor,
  painPoints,
  shortDate,
  toDateKey,
  topSetSeries,
} from "@/lib/ski/program";
import { getSkiExercise } from "@/lib/ski/exercises";

// The four lifts whose top-set weight we trend.
const TRENDS = ["goblet-squat", "deadlift", "bulgarian-split-squat", "barbell-rdl"];

export default function SkiProgressPage() {
  const { data, ready } = useAppData();
  const router = useRouter();
  const program = data.ski;
  if (!ready) return <p className="mt-6 text-center text-xs text-text-3">Loading…</p>;
  if (!program) {
    return (
      <div className="py-10 text-center">
        <Link href="/ski" className="font-bold text-accent-text">Start the Pre-Ski program</Link>
      </div>
    );
  }

  const todayIndex = dayIndexFor(program, toDateKey(new Date()));
  const planned = program.schedule.filter((k) => k !== "rest").length;
  const done = program.sessions.length;

  return (
    <div>
      <Link href="/ski" className="mb-2 inline-flex items-center gap-1 text-[13px] font-bold text-text-3">
        <span className="rotate-180"><IconChevron s={13} /></span> Pre-Ski
      </Link>
      <PageHeader
        title="Ski progress"
        subtitle={`${done} of ${planned} sessions done · ${Math.max(0, Math.min(PROGRAM_DAYS, todayIndex + 1))} of ${PROGRAM_DAYS} days in`}
      />

      <Card className="mb-3">
        <SectionLabel>Completed sessions</SectionLabel>
        <SkiCalendar
          program={program}
          todayIndex={todayIndex}
          onOpenDay={(i) => program.schedule[i] !== "rest" && router.push(`/ski/day/${i}`)}
        />
      </Card>

      <Card className="mb-3">
        <SectionLabel>Knee pain (0–10)</SectionLabel>
        <PainChart points={painPoints(program)} startDate={program.startDate} days={PROGRAM_DAYS} />
      </Card>

      <SectionLabel className="mt-5">Top-set weight</SectionLabel>
      <div className="flex flex-col gap-3">
        {TRENDS.map((id) => {
          const ex = getSkiExercise(id)!;
          const series = topSetSeries(program, id);
          const best = series.length ? Math.max(...series.map((p) => p.weight)) : null;
          return (
            <Card key={id}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[15px] font-extrabold">{ex.name}</span>
                {best !== null && (
                  <span className="text-[13px] font-bold tabular-nums text-text-2">
                    best {formatWeight(best)} {data.unit}
                  </span>
                )}
              </div>
              {series.length ? (
                <LineChart
                  points={series.map((p) => ({ label: shortDate(p.date), value: p.weight }))}
                  unit={data.unit}
                />
              ) : (
                <p className="text-[13px] font-medium text-text-3">No sets logged yet.</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
