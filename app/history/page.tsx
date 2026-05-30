"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card, PageHeader } from "@/components/ui";
import { LineChart } from "@/components/LineChart";
import { getExercise } from "@/lib/exercises";
import { loggedExerciseIds, seriesForExercise } from "@/lib/history";

export default function HistoryPage() {
  const { data } = useAppData();
  const ids = useMemo(() => loggedExerciseIds(data), [data]);
  const [selected, setSelected] = useState<string | null>(null);

  const activeId = selected ?? ids[0] ?? null;
  const series = useMemo(
    () => (activeId ? seriesForExercise(data, activeId) : []),
    [data, activeId],
  );

  if (ids.length === 0) {
    return (
      <div>
        <PageHeader
          title="History & Progress"
          subtitle="Charts of weight and total volume per exercise over time."
        />
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <ChartIcon />
          <h2 className="text-lg font-semibold">No data yet</h2>
          <p className="max-w-xs text-sm text-muted">
            Log a few sessions on the Today tab and your weight and volume
            trends will appear here.
          </p>
        </Card>
      </div>
    );
  }

  const ex = activeId ? getExercise(activeId) : null;
  const weightPoints = series.map((s) => ({
    label: s.label,
    value: s.topWeight,
  }));
  const volumePoints = series.map((s) => ({
    label: s.label,
    value: s.totalVolume,
  }));

  return (
    <div>
      <PageHeader
        title="History & Progress"
        subtitle="Pick an exercise to see your trends."
      />

      {/* Exercise picker */}
      <select
        value={activeId ?? ""}
        onChange={(e) => setSelected(e.target.value)}
        className="mb-4 h-12 w-full rounded-xl border border-border bg-surface-2 px-3 text-base font-medium text-text outline-none focus:border-accent"
      >
        {ids.map((id) => (
          <option key={id} value={id}>
            {getExercise(id)?.name ?? id}
          </option>
        ))}
      </select>

      {series.length === 1 && (
        <Card className="mb-4 border-accent/30 bg-accent/5">
          <p className="text-sm text-muted">
            One session logged so far — log another to see a trend line form.
          </p>
        </Card>
      )}

      <Card className="mb-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Top set weight ({data.unit})
        </h2>
        <LineChart points={weightPoints} unit={data.unit} color="#3b82f6" />
      </Card>

      <Card className="mb-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          Total volume ({data.unit} × reps)
        </h2>
        <LineChart points={volumePoints} color="#22c55e" />
      </Card>

      {/* Recent sessions table */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          {ex?.name} — recent sessions
        </h2>
        <div className="space-y-2">
          {[...series].reverse().map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0"
            >
              <span className="text-sm text-muted">{s.label}</span>
              <span className="text-sm">
                <span className="font-semibold">
                  {s.topWeight} {data.unit}
                </span>{" "}
                · best {s.bestReps} reps · {s.sets} sets
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ChartIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      className="text-accent"
      aria-hidden
    >
      <path
        d="M4 20V10M10 20V4M16 20v-7M22 20H2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
