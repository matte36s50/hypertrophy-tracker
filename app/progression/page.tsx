"use client";

import { useMemo } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card, PageHeader, SectionLabel, VolumeBar, formatWeight } from "@/components/ui";
import { IconArrowUp, IconFlame } from "@/components/icons";
import { MUSCLE_LABELS, MUSCLE_ORDER, VOLUME_LANDMARKS } from "@/lib/muscles";
import { statusForSets, weeklyVolume } from "@/lib/volume";
import { progressionNudges } from "@/lib/progression";
import { deloadAdvice } from "@/lib/deload";
import { getExercise } from "@/lib/exercises";
import type { MuscleGroup } from "@/lib/types";
import type { VolumeStatus } from "@/lib/volume";

const STATUS_TEXT: Record<VolumeStatus, string> = {
  "under-mev": "Below MEV — add a set or two next week",
  "in-range": "MEV–MAV — productive, keep adding sets",
  "above-mav": "Above MAV — strong stimulus, progress slowly toward MRV",
  "near-mrv": "Near MRV — hold volume, watch recovery",
  "over-mrv": "Over MRV — consider a lighter week",
};

// Status dot + text colour, and the volume-bar fill colour.
function statusStyle(status: VolumeStatus) {
  if (status === "above-mav")
    // Peak adaptive zone — the target. Solid green dot + green text.
    return { dot: "bg-good", text: "text-accent-text", fill: "bg-accent" };
  if (status === "in-range")
    // Building toward the sweet spot — productive but below MAV.
    return { dot: "bg-accent", text: "text-text-2", fill: "bg-accent" };
  if (status === "over-mrv")
    return { dot: "bg-bad", text: "text-bad-text", fill: "bg-bad" };
  if (status === "under-mev")
    return { dot: "bg-warn", text: "text-warn-text", fill: "bg-warn" };
  // near-mrv
  return { dot: "bg-warn", text: "text-warn-text", fill: "bg-accent" };
}

export default function ProgressionPage() {
  const { data } = useAppData();

  const volumeMap = useMemo(() => {
    const map: Partial<Record<MuscleGroup, number>> = {};
    for (const v of weeklyVolume(data)) map[v.muscle] = v.sets;
    return map;
  }, [data]);

  const nudges = useMemo(() => progressionNudges(data), [data]);
  const deload = useMemo(() => deloadAdvice(data), [data]);
  const hasLogs = data.logs.length > 0;

  return (
    <div>
      <PageHeader
        title="Progression"
        subtitle="When to add weight, and how your weekly volume stacks up."
      />

      {/* --- Deload recommendation (fatigue management) --- */}
      {deload.recommended && (
        <Card className="mb-[22px] border-warn bg-warn/10">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-warn text-accent-contrast">
              <IconFlame s={18} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-extrabold text-text">
                Deload recommended
              </h3>
              <p className="mt-1 text-[13.5px] font-medium leading-relaxed text-warn-text">
                {deload.reason}
              </p>
              <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-text-2">
                {deload.guidance}
              </p>
              {deload.fatiguedMuscles.length > 0 && (
                <p className="mt-1.5 text-[12.5px] font-semibold text-text-3">
                  Most fatigued:{" "}
                  {deload.fatiguedMuscles
                    .map((m) => MUSCLE_LABELS[m])
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* --- Add-weight nudges (double progression) --- */}
      <SectionLabel>Ready to progress</SectionLabel>
      {nudges.length === 0 ? (
        <Card className="mb-[22px]">
          <p className="text-sm leading-relaxed text-text-2">
            {hasLogs
              ? "Nothing to bump yet. Hit the top of a rep range twice in a row at target RIR and a nudge appears here."
              : "Log a few sessions and add-weight nudges will appear here."}
          </p>
        </Card>
      ) : (
        <div className="mb-[22px] flex flex-col gap-3">
          {nudges.map((n) => {
            const ex = getExercise(n.exerciseId);
            if (!ex) return null;
            const ready = n.status === "add-weight";
            return (
              <Card
                key={n.exerciseId}
                className={ready ? "border-accent bg-accent-soft" : ""}
              >
                <div className="flex gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-input ${
                      ready
                        ? "bg-accent text-accent-contrast"
                        : "bg-surface-3 text-text-2"
                    }`}
                  >
                    {ready ? <IconArrowUp s={20} /> : <IconFlame s={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2.5">
                      <h3 className="text-base font-extrabold text-text">
                        {ex.name}
                      </h3>
                      {ready && n.suggestedWeight != null && (
                        <span className="shrink-0 rounded-full bg-accent px-2.5 py-[3px] text-[13.5px] font-extrabold tabular-nums text-accent-contrast">
                          → {formatWeight(n.suggestedWeight)} {data.unit}
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-1 text-[13.5px] font-medium leading-relaxed ${
                        ready ? "text-accent-text" : "text-text-2"
                      }`}
                    >
                      {n.message}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* --- Weekly volume vs RP landmarks --- */}
      <SectionLabel>Weekly volume · this week</SectionLabel>

      {/* Plain-English primer on the RP volume landmarks the bars are graded
          against, so the MEV / MAV / MRV ticks aren't just jargon. */}
      <Card className="mb-3">
        <h3 className="text-[14px] font-extrabold text-text">
          What do MEV, MAV &amp; MRV mean?
        </h3>
        <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-text-2">
          These are weekly working-set targets per muscle, from Renaissance
          Periodization.
        </p>
        <ul className="mt-2.5 flex flex-col gap-2">
          <li className="flex gap-2.5">
            <span className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-warn" />
            <span className="text-[13px] leading-relaxed text-text-2">
              <b className="font-bold text-text">MEV — Minimum Effective Volume.</b>{" "}
              The fewest sets that still build muscle. Below this you&apos;re
              maintaining, not growing.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />
            <span className="text-[13px] leading-relaxed text-text-2">
              <b className="font-bold text-text">MAV — Maximum Adaptive Volume.</b>{" "}
              The productive sweet spot most weeks should land in.
            </span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-bad" />
            <span className="text-[13px] leading-relaxed text-text-2">
              <b className="font-bold text-text">MRV — Maximum Recoverable Volume.</b>{" "}
              The most you can recover from. Past this, extra sets hurt more than
              they help.
            </span>
          </li>
        </ul>
        <p className="mt-2.5 text-[12.5px] font-medium leading-relaxed text-text-3">
          Aim to sit between MEV and MAV, then creep toward MRV across a training
          block.
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        {MUSCLE_ORDER.map((muscle) => {
          const sets = volumeMap[muscle] ?? 0;
          const lm = VOLUME_LANDMARKS[muscle];
          const status = statusForSets(muscle, sets);
          const s = statusStyle(status);
          return (
            <Card key={muscle}>
              <div className="mb-2.5 flex items-baseline justify-between">
                <h3 className="text-[15.5px] font-extrabold text-text">
                  {MUSCLE_LABELS[muscle]}
                </h3>
                <span className="text-sm font-bold tabular-nums text-text-2">
                  {sets}
                  <span className="font-semibold text-text-3"> / {lm.mav} sets</span>
                </span>
              </div>

              <VolumeBar
                value={sets}
                max={lm.mrv}
                colorClass={s.fill}
                ticks={[
                  { at: lm.mev, label: "MEV" },
                  { at: lm.mav, label: "MAV" },
                ]}
              />

              <div className="mt-1.5 flex justify-between text-[11px] font-semibold tabular-nums text-text-3">
                <span>MEV {lm.mev}</span>
                <span>MAV {lm.mav}</span>
                <span>MRV {lm.mrv}</span>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5">
                <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${s.dot}`} />
                <span className={`text-[13px] font-bold ${s.text}`}>
                  {STATUS_TEXT[status]}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
