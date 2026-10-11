"use client";

import { useState } from "react";
import type { PainPoint } from "@/lib/ski/program";
import { addDays, daysBetween, shortDate } from "@/lib/ski/program";

const DURING = "#10a05a";
const MORNING = "#4a5fd6";

// Knee pain 0–10 over the program, two series on one fixed scale: during the
// session (solid) and the next morning (dashed). A dashed rule marks the 3/10
// flag threshold. Tap a point to read its value.
export function PainChart({
  points,
  startDate,
  days,
}: {
  points: PainPoint[];
  startDate: string;
  days: number;
}) {
  const [active, setActive] = useState<PainPoint | null>(null);
  const W = 300;
  const H = 150;
  const padL = 22;
  const padR = 10;
  const padTop = 10;
  const padBot = 22;
  const x = (date: string) =>
    padL + (Math.min(days, Math.max(0, daysBetween(startDate, date))) / days) * (W - padL - padR);
  const y = (v: number) => padTop + (1 - v / 10) * (H - padTop - padBot);

  const series = (kind: PainPoint["kind"]) => points.filter((p) => p.kind === kind);
  const path = (pts: PainPoint[]) =>
    pts.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");

  return (
    <div>
      <div className="mb-2 flex gap-4 text-[12px] font-semibold text-text-2">
        <span className="flex items-center gap-1.5">
          <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke={DURING} strokeWidth="2" /></svg>
          During session
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke={MORNING} strokeWidth="2" strokeDasharray="4 3" /></svg>
          Next morning
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Knee pain over time" style={{ overflow: "visible" }}>
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="#e2e7e3" strokeWidth={1} />
            <text x={padL - 6} y={y(v) + 3.5} textAnchor="end" fontSize="10" fontWeight="600" fill="#8b958e">{v}</text>
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={y(3)} y2={y(3)} stroke="#a4630a" strokeWidth={1} strokeDasharray="3 3" />
        <text x={W - padR} y={y(3) - 4} textAnchor="end" fontSize="9.5" fontWeight="700" fill="#a4630a">flag &gt;3</text>
        {[1, 2, 3, 4, 5, 6].map((w) => (
          <text key={w} x={x(addDays(startDate, (w - 1) * 7 + 3))} y={H - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill="#8b958e">W{w}</text>
        ))}
        <path d={path(series("during"))} fill="none" stroke={DURING} strokeWidth={2} strokeLinejoin="round" />
        <path d={path(series("morning"))} fill="none" stroke={MORNING} strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i} onClick={() => setActive(p)} style={{ cursor: "pointer" }}>
            <circle cx={x(p.date)} cy={y(p.value)} r={11} fill="transparent" />
            <circle
              cx={x(p.date)}
              cy={y(p.value)}
              r={p.kind === "during" ? 4 : 3.5}
              fill={p.kind === "during" ? DURING : "#ffffff"}
              stroke={p.kind === "during" ? "#ffffff" : MORNING}
              strokeWidth={2}
            />
          </g>
        ))}
      </svg>
      <p className="mt-1 min-h-[18px] text-[12.5px] font-semibold text-text-2">
        {active
          ? `${shortDate(active.date)} · ${active.kind === "during" ? "during session" : "next morning"}: ${active.value}/10`
          : points.length
            ? "Tap a point for its value."
            : "No ratings yet — they appear after your first session."}
      </p>
    </div>
  );
}

