"use client";

import { useMemo } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card, PageHeader } from "@/components/ui";
import { MUSCLE_LABELS, MUSCLE_ORDER, VOLUME_LANDMARKS } from "@/lib/muscles";
import { statusForSets, weeklyVolume } from "@/lib/volume";
import type { MuscleGroup } from "@/lib/types";
import type { VolumeStatus } from "@/lib/volume";

const STATUS_TEXT: Record<VolumeStatus, string> = {
  "under-mev": "Below MEV — room to add sets",
  "in-range": "In the productive range",
  "near-mrv": "Near MRV — be cautious",
  "over-mrv": "Over MRV — consider backing off",
};

const STATUS_COLOR: Record<VolumeStatus, string> = {
  "under-mev": "text-warning",
  "in-range": "text-success",
  "near-mrv": "text-warning",
  "over-mrv": "text-danger",
};

export default function ProgressionPage() {
  const { data } = useAppData();

  const volumeMap = useMemo(() => {
    const map: Partial<Record<MuscleGroup, number>> = {};
    for (const v of weeklyVolume(data)) map[v.muscle] = v.sets;
    return map;
  }, [data]);

  return (
    <div>
      <PageHeader
        title="Progression"
        subtitle="Your weekly volume vs. MEV / MAV / MRV landmarks."
      />

      <Card className="mb-4 border-accent/30 bg-accent/10">
        <p className="text-sm text-text">
          <span className="font-semibold">How this works:</span> once you start
          logging (Phase 2), this page fills with live set counts and tells you
          when to add weight using double progression. For now it shows the
          target ranges for every muscle.
        </p>
      </Card>

      <div className="space-y-3">
        {MUSCLE_ORDER.map((muscle) => {
          const sets = volumeMap[muscle] ?? 0;
          const lm = VOLUME_LANDMARKS[muscle];
          const status = statusForSets(muscle, sets);
          // Bar fill relative to MRV.
          const pct = Math.min(100, (sets / lm.mrv) * 100);
          return (
            <Card key={muscle}>
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-base font-semibold">
                  {MUSCLE_LABELS[muscle]}
                </h2>
                <span className="text-sm text-muted">
                  {sets} / {lm.mav} sets
                </span>
              </div>

              {/* Volume bar with MEV and MRV markers. */}
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${pct}%` }}
                />
                {/* MEV marker */}
                <div
                  className="absolute top-0 h-full w-0.5 bg-muted/70"
                  style={{ left: `${(lm.mev / lm.mrv) * 100}%` }}
                  title="MEV"
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted">
                <span>MEV {lm.mev}</span>
                <span>MAV {lm.mav}</span>
                <span>MRV {lm.mrv}</span>
              </div>

              <p className={`mt-2 text-sm font-medium ${STATUS_COLOR[status]}`}>
                {STATUS_TEXT[status]}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
