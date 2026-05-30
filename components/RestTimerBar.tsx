"use client";

import { useRestTimer } from "@/components/RestTimerProvider";

// Floating rest-timer bar. Sits just above the bottom nav and only shows while
// a rest is running or has just finished.
export function RestTimerBar() {
  const { remaining, active, finished, addSeconds, skip } = useRestTimer();

  if (!active && !finished) return null;

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const time = `${mm}:${ss.toString().padStart(2, "0")}`;

  return (
    <div
      className="fixed inset-x-0 z-40 px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 4.5rem)" }}
    >
      <div className="mx-auto w-full max-w-md">
        {finished ? (
          <button
            type="button"
            onClick={skip}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-success/40 bg-success/20 px-4 py-3 text-base font-bold text-success shadow-lg active:opacity-80"
          >
            Rest done — go! (tap to dismiss)
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2 px-3 py-2 shadow-lg">
            <span className="text-xs font-medium text-muted">Rest</span>
            <span className="min-w-[3.5rem] text-center text-xl font-bold tabular-nums">
              {time}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => addSeconds(-30)}
                className="h-9 rounded-lg border border-border bg-surface px-2.5 text-sm font-semibold active:bg-border"
              >
                −30
              </button>
              <button
                type="button"
                onClick={() => addSeconds(30)}
                className="h-9 rounded-lg border border-border bg-surface px-2.5 text-sm font-semibold active:bg-border"
              >
                +30
              </button>
              <button
                type="button"
                onClick={skip}
                className="h-9 rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-muted active:bg-border"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
