"use client";

import { useRestTimer } from "@/components/RestTimerProvider";
import { IconFlame, IconCheck } from "@/components/icons";

// Floating rest-timer bar. Sits just above the bottom nav and only shows while
// a rest is running or has just finished. Accent-tinted to match the design.
export function RestTimerBar() {
  const { remaining, total, active, finished, addSeconds, skip } =
    useRestTimer();

  if (!active && !finished) return null;

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const time = `${mm}:${ss.toString().padStart(2, "0")}`;
  const pct = total > 0 ? (remaining / total) * 100 : 0;

  const chip =
    "press h-9 rounded-chip border border-border bg-surface-3 px-2.5 text-[13px] font-extrabold tabular-nums text-text";

  return (
    <div
      className="fixed inset-x-0 z-40 px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 4.75rem)" }}
    >
      <div className="mx-auto w-full max-w-md">
        {finished ? (
          <button
            type="button"
            onClick={skip}
            className="flex w-full items-center justify-center gap-2 rounded-btn border border-accent bg-accent px-4 py-3 text-base font-bold text-accent-contrast shadow-lg active:opacity-90"
          >
            <IconCheck s={18} /> Rest done — go! (tap to dismiss)
          </button>
        ) : (
          <div className="rounded-btn border border-accent bg-accent-soft px-3 pb-3 pt-2.5 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast">
                <IconFlame s={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-bold uppercase tracking-[0.05em] text-accent-text">
                  Rest
                </div>
                <div className="text-xl font-extrabold leading-tight tabular-nums text-text">
                  {time}
                </div>
              </div>
              <button type="button" onClick={() => addSeconds(-30)} className={chip}>
                −30
              </button>
              <button type="button" onClick={() => addSeconds(30)} className={chip}>
                +30
              </button>
              <button
                type="button"
                onClick={skip}
                className="press h-9 rounded-chip border border-transparent bg-accent px-3 text-[13px] font-extrabold text-accent-contrast"
              >
                Skip
              </button>
            </div>
            {/* Countdown track — drains smoothly as the rest ticks away. */}
            <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${pct}%`, transition: "width 1s linear" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
