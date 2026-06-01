"use client";

// A tiny dependency-free SVG line chart for one numeric series. Draws an area
// gradient under an accent/grey line, a dot per session, x-axis date labels,
// and a label on the last point. Built for small phone screens.
export interface ChartPoint {
  label: string;
  value: number;
}

export function LineChart({
  points,
  unit,
  color = "#10a05a",
}: {
  points: ChartPoint[];
  unit?: string;
  color?: string;
}) {
  const W = 300;
  const H = 132;
  const padL = 34;
  const padR = 44;
  const padTop = 18;
  const padBot = 26;

  if (points.length === 0) return null;

  const vals = points.map((p) => p.value);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.15;
  min -= pad;
  max += pad;

  const x = (i: number) =>
    padL +
    (points.length === 1
      ? (W - padL - padR) / 2
      : (i / (points.length - 1)) * (W - padL - padR));
  const y = (v: number) =>
    padTop + (1 - (v - min) / (max - min)) * (H - padTop - padBot);

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${(H - padBot).toFixed(
    1,
  )} L${x(0).toFixed(1)},${(H - padBot).toFixed(1)} Z`;
  const last = points[points.length - 1];
  const gid = `g-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", overflow: "visible" }}
      role="img"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* baseline */}
      <line
        x1={padL}
        y1={H - padBot}
        x2={W - padR}
        y2={H - padBot}
        stroke="#e2e7e3"
        strokeWidth={1}
      />
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map((p, i) => {
        const isLast = i === points.length - 1;
        const isFirst = i === 0;
        const anchor = isLast ? "end" : isFirst ? "start" : "middle";
        return (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r={isLast ? 4.5 : 3}
              fill="#ffffff"
              stroke={color}
              strokeWidth={2.5}
            />
            <text
              x={x(i)}
              y={H - padBot + 16}
              textAnchor={anchor}
              fontSize="10"
              fontWeight="600"
              fill="#8b958e"
              className="tabular-nums"
            >
              {p.label}
            </text>
          </g>
        );
      })}
      <text
        x={x(points.length - 1)}
        y={y(last.value) - 9}
        textAnchor="end"
        fontSize="11.5"
        fontWeight="800"
        fill={color}
        className="tabular-nums"
      >
        {Math.round(last.value)}
        {unit ? ` ${unit}` : ""}
      </text>
    </svg>
  );
}
