import type { Tier } from "@/lib/types";

// Page heading used at the top of each screen.
export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </header>
  );
}

// A rounded surface panel.
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-4 ${className}`}
    >
      {children}
    </div>
  );
}

// Small coloured S/A/B tier chip.
export function TierBadge({ tier }: { tier: Tier }) {
  const styles: Record<Tier, string> = {
    S: "bg-success/15 text-success border-success/30",
    A: "bg-accent/15 text-accent border-accent/30",
    B: "bg-muted/15 text-muted border-muted/30",
  };
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold ${styles[tier]}`}
    >
      {tier}
    </span>
  );
}

// A pill describing required equipment.
export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-xs text-muted">
      {children}
    </span>
  );
}
