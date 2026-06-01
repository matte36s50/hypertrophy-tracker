"use client";

import { Sheet, SheetButton } from "@/components/Sheet";
import { formatWeight } from "@/components/ui";
import { IconTrophy } from "@/components/icons";

interface WorkoutCompleteSheetProps {
  // True when every planned set was logged; false for an early finish.
  complete: boolean;
  dayLabel: string;
  setsLogged: number;
  volume: number;
  unit: "kg" | "lb";
  musclesTrained: number;
  onViewProgress: () => void;
  onClose: () => void;
}

// A handful of confetti colours pulled from the design tokens.
const CONFETTI_COLORS = ["#10a05a", "#c8780b", "#d8403e", "#0d7c46", "#8b958e"];

// Celebratory bottom-sheet shown when a workout is finished (or ended early).
// Confetti rains down, the trophy pops, and we recap the session's numbers.
export function WorkoutCompleteSheet({
  complete,
  dayLabel,
  setsLogged,
  volume,
  unit,
  musclesTrained,
  onViewProgress,
  onClose,
}: WorkoutCompleteSheetProps) {
  const title = complete ? "Workout complete!" : "Workout logged!";
  const subtitle = complete
    ? `You finished every set of ${dayLabel} day. Recovery is where the gains happen.`
    : `Nice work wrapping ${dayLabel} day early — every set still counts.`;

  return (
    <Sheet onClose={onClose}>
      {/* Confetti layer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible">
        {Array.from({ length: 18 }).map((_, i) => {
          const left = (i * 53) % 100;
          const delay = (i % 6) * 0.12;
          const duration = 1.1 + ((i % 5) * 0.18);
          const size = 7 + (i % 3) * 3;
          return (
            <span
              key={i}
              className="absolute top-0 animate-confetti rounded-[2px]"
              style={{
                left: `${left}%`,
                width: size,
                height: size,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>

      <div className="flex flex-col items-center pb-1 pt-2 text-center">
        <span className="mb-4 flex h-[72px] w-[72px] animate-popIn items-center justify-center rounded-full bg-accent-soft text-accent">
          <IconTrophy s={38} />
        </span>
        <h3 className="text-[24px] font-extrabold tracking-[-0.01em] text-text">
          {title}
        </h3>
        <p className="mx-auto mt-1.5 max-w-[300px] text-[14px] font-medium leading-snug text-text-2">
          {subtitle}
        </p>

        {/* Session recap */}
        <div className="mt-5 grid w-full grid-cols-3 gap-2.5">
          <Stat value={String(setsLogged)} label="Sets" />
          <Stat value={formatWeight(volume)} label={`${unit} volume`} />
          <Stat value={String(musclesTrained)} label="Muscles" />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        <SheetButton onClick={onViewProgress}>View progress</SheetButton>
        <SheetButton variant="ghost" onClick={onClose}>
          Done
        </SheetButton>
      </div>
    </Sheet>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-row border border-border bg-surface-2 px-2 py-3">
      <div className="text-[22px] font-extrabold tabular-nums leading-none text-text">
        {value}
      </div>
      <div className="mt-1.5 text-[11.5px] font-bold uppercase tracking-[0.03em] text-text-3">
        {label}
      </div>
    </div>
  );
}
