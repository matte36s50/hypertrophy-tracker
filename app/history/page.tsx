"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/components/DataProvider";
import { Card, PageHeader, SectionLabel, formatWeight } from "@/components/ui";
import { LineChart } from "@/components/LineChart";
import { IconChevDown, IconCheck, IconHistory } from "@/components/icons";
import { getExercise } from "@/lib/exercises";
import { loggedExerciseIds, seriesForExercise } from "@/lib/history";
import { sessionsForExercise } from "@/lib/progression";

export default function HistoryPage() {
  const { data } = useAppData();
  const ids = useMemo(() => loggedExerciseIds(data), [data]);
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Default to the exercise with the most logged sessions so a trend shows.
  const richest = useMemo(() => {
    let best = ids[0] ?? null;
    let bestN = -1;
    for (const id of ids) {
      const n = sessionsForExercise(data, id).length;
      if (n > bestN) {
        bestN = n;
        best = id;
      }
    }
    return best;
  }, [data, ids]);

  const activeId = selected ?? richest ?? null;
  const series = useMemo(
    () => (activeId ? seriesForExercise(data, activeId) : []),
    [data, activeId],
  );

  if (ids.length === 0) {
    return (
      <div>
        <PageHeader
          title="History"
          subtitle="Charts of weight and volume per exercise."
        />
        <Card className="flex flex-col items-center gap-3 py-9 text-center">
          <span className="text-accent-text">
            <IconHistory s={48} />
          </span>
          <h2 className="text-lg font-extrabold">No data yet</h2>
          <p className="max-w-[240px] text-sm leading-relaxed text-text-2">
            Log a few sessions and your weight &amp; volume trends will appear
            here.
          </p>
        </Card>
      </div>
    );
  }

  const ex = activeId ? getExercise(activeId) : null;
  const weightPoints = series.map((s) => ({ label: s.label, value: s.topWeight }));
  const volumePoints = series.map((s) => ({
    label: s.label,
    value: s.totalVolume,
  }));

  return (
    <div>
      <PageHeader title="History" subtitle="Pick an exercise to see your trends." />

      {/* Custom dropdown picker */}
      <div className="relative mb-3.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-btn border border-border bg-surface px-4 py-3 shadow-card"
        >
          <span className="text-[15.5px] font-bold text-text">{ex?.name}</span>
          <span
            className={`text-text-3 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <IconChevDown s={18} />
          </span>
        </button>
        {open && (
          <div className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-[260px] overflow-y-auto rounded-btn border border-border bg-surface shadow-pop">
            {ids.map((id) => {
              const isActive = id === activeId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelected(id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14.5px] ${
                    isActive
                      ? "bg-accent-soft font-extrabold text-accent-text"
                      : "font-semibold text-text"
                  }`}
                >
                  {getExercise(id)?.name ?? id}
                  {isActive && <IconCheck s={16} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Card className="mb-3">
        <SectionLabel className="mb-1">
          Top set weight ({data.unit})
        </SectionLabel>
        <LineChart points={weightPoints} unit={data.unit} color="#10a05a" />
      </Card>

      <Card className="mb-3">
        <SectionLabel className="mb-1">
          Total volume ({data.unit} × reps)
        </SectionLabel>
        <LineChart points={volumePoints} color="#5b665f" />
      </Card>

      {/* Recent sessions */}
      <Card>
        <SectionLabel>{ex?.name} — recent sessions</SectionLabel>
        <div className="flex flex-col">
          {[...series].reverse().map((s, i, arr) => (
            <div
              key={i}
              className={`flex items-center justify-between py-2.5 ${
                i === arr.length - 1 ? "" : "border-b border-border"
              }`}
            >
              <span className="text-[13.5px] font-semibold tabular-nums text-text-2">
                {s.label}
              </span>
              <span className="text-[13.5px] tabular-nums text-text">
                <b className="font-extrabold">
                  {formatWeight(s.topWeight)} {data.unit}
                </b>
                <span className="font-semibold text-text-3">
                  {" "}
                  · best {s.bestReps} · {s.sets} sets
                </span>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
