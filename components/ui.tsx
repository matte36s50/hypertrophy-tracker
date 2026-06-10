import type { Tier } from "@/lib/types";

// Screen heading used at the top of each screen (H1, 28px / 800).
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-[18px]">
      <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1.5 text-sm font-medium leading-snug text-text-2">
          {subtitle}
        </p>
      )}
    </header>
  );
}

// Uppercase group header (12.5px / 700, letter-spaced).
export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mb-2.5 text-[12.5px] font-bold uppercase tracking-[0.06em] text-text-3 ${className}`}
    >
      {children}
    </div>
  );
}

// A rounded white surface panel with subtle elevation.
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-border bg-surface p-[18px] shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

// Square S/A/B tier badge. S = accent-soft, A = grey, B = faint.
export function TierBadge({
  tier,
  size = 32,
}: {
  tier: Tier;
  size?: number;
}) {
  const tone: Record<Tier, string> = {
    S: "bg-accent-soft text-accent-text border-accent",
    A: "bg-surface-3 text-text-2 border-border-strong",
    B: "bg-surface-2 text-text-3 border-border",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-badge border font-extrabold ${tone[tier]}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.46) }}
    >
      {tier}
    </span>
  );
}

// A rounded outline pill for equipment / rep-range / RIR metadata.
export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[12.5px] font-semibold tabular-nums text-text-2">
      {children}
    </span>
  );
}

// Segmented progress bar with optional landmark ticks (MEV / MAV).
export function VolumeBar({
  value,
  max,
  ticks = [],
  colorClass,
  height = 10,
}: {
  value: number;
  max: number;
  ticks?: { at: number; label: string }[];
  colorClass: string;
  height?: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div
      className="relative w-full overflow-hidden rounded-full bg-surface-3"
      style={{ height }}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ease-out ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
      {ticks.map((tk) => (
        <div
          key={tk.label}
          title={tk.label}
          className="absolute -top-0.5 -bottom-0.5 w-0.5 bg-black/25"
          style={{ left: `${Math.min(100, (tk.at / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

// Circular session-progress ring. Shows `done` over `of total`, centred.
export function RingProgress({
  done,
  total,
  size = 72,
}: {
  done: number;
  total: number;
  size?: number;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-surface-3"
          strokeWidth={7}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className="stroke-accent"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset .4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="text-xl font-extrabold tabular-nums text-text">
          {done}
        </span>
        <span className="text-[11.5px] font-semibold tabular-nums text-text-3">
          of {total}
        </span>
      </div>
    </div>
  );
}

// Compact +/- stepper used in the plan editor and swap sheet.
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  suffix,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const btn =
    "press flex h-[38px] w-[38px] items-center justify-center rounded-chip border border-border bg-surface-2 text-xl font-semibold leading-none text-text disabled:opacity-40";
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        className={btn}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        aria-label="Decrease"
      >
        −
      </button>
      <span className="min-w-[58px] text-center text-[15px] font-bold tabular-nums text-text">
        {value}
        {suffix ? ` ${suffix}` : ""}
      </span>
      <button
        type="button"
        className={btn}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

// Small helper: format a weight without trailing ".0".
export function formatWeight(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
