"use client";

// A tiny dependency-free SVG line chart for one numeric series. It scales to
// the data and draws points + a smooth-ish polyline. Built for small screens.
export interface ChartPoint {
  label: string;
  value: number;
}

export function LineChart({
  points,
  unit,
  color = "#3b82f6",
}: {
  points: ChartPoint[];
  unit?: string;
  color?: string;
}) {
  const width = 320;
  const height = 120;
  const padX = 8;
  const padY = 16;

  if (points.length === 0) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  // X positions evenly spaced; a single point sits centred.
  const x = (i: number) =>
    points.length === 1
      ? width / 2
      : padX + (i / (points.length - 1)) * innerW;
  const y = (v: number) => padY + innerH - ((v - min) / span) * innerH;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");

  // Area fill path (under the line).
  const area =
    points.length > 1
      ? `${line} L ${x(points.length - 1)} ${padY + innerH} L ${x(0)} ${padY + innerH} Z`
      : "";

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
      >
        {area && <path d={area} fill={color} opacity={0.12} />}
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.value)} r={3.5} fill={color} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>
          {points[0].label}
          {unit ? ` · ${min}${unit}` : ""}
        </span>
        <span>
          {points[points.length - 1].label}
          {unit ? ` · ${max}${unit}` : ""}
        </span>
      </div>
    </div>
  );
}
