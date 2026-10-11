"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IntervalSpec } from "@/lib/ski/types";
import { Sheet, SheetButton } from "@/components/Sheet";

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

// Full interval timer: runs through each phase with a beep + vibration at every
// transition. Uses absolute end times so it stays accurate if the phone
// throttles timers, and holds a screen wake lock while running.
export function IntervalTimerSheet({
  spec,
  onDone,
  onClose,
}: {
  spec: IntervalSpec;
  onDone: () => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(spec.phases[0]?.seconds ?? 0);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const wake = useRef<{ release: () => Promise<void> } | null>(null);
  // Last second we beeped the 3-2-1 countdown on (ticks run 4×/second).
  const lastTick = useRef<number | null>(null);

  const beep = useCallback((freq: number, ms = 250) => {
    const ctx = audio.current;
    if (!ctx) return;
    try {
      void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
      osc.start();
      osc.stop(ctx.currentTime + ms / 1000);
    } catch {
      /* ignore audio failures */
    }
  }, []);

  const releaseWake = useCallback(() => {
    void wake.current?.release().catch(() => {});
    wake.current = null;
  }, []);

  function start() {
    if (!audio.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) audio.current = new Ctx();
    }
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
    };
    nav.wakeLock?.request("screen").then((w) => (wake.current = w)).catch(() => {});
    setEndAt(Date.now() + remaining * 1000);
  }

  function pause() {
    setEndAt(null);
    releaseWake();
  }

  const advance = useCallback(
    (from: number) => {
      const next = from + 1;
      if (next >= spec.phases.length) {
        setEndAt(null);
        setRemaining(0);
        setFinished(true);
        beep(1046, 600);
        navigator.vibrate?.([300, 120, 300]);
        releaseWake();
        return;
      }
      setIndex(next);
      const secs = spec.phases[next].seconds;
      setRemaining(secs);
      setEndAt((e) => (e === null ? null : Date.now() + secs * 1000));
      beep(spec.phases[next].kind === "work" ? 880 : 520);
      navigator.vibrate?.(200);
    },
    [spec, beep, releaseWake],
  );

  useEffect(() => {
    if (endAt === null) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left >= 1 && left <= 3 && lastTick.current !== left) beep(660, 90);
      lastTick.current = left;
      if (left <= 0) advance(index);
    }, 1000 / 4);
    return () => clearInterval(id);
  }, [endAt, index, advance, beep]);

  useEffect(() => releaseWake, [releaseWake]);

  const phase = spec.phases[index];
  const next = spec.phases[index + 1];
  const running = endAt !== null;
  const tone =
    phase?.kind === "work"
      ? "bg-accent text-accent-contrast"
      : phase?.kind === "easy"
        ? "bg-surface-3 text-text"
        : "bg-surface-2 text-text";

  return (
    <Sheet title={spec.name} onClose={onClose}>
      {finished ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <span className="text-[44px]">✓</span>
          <p className="text-lg font-extrabold">Block complete</p>
        </div>
      ) : (
        <div className={`flex flex-col items-center rounded-card py-7 ${tone}`}>
          <span className="text-[15px] font-bold uppercase tracking-[0.06em] opacity-80">
            {phase?.label}
          </span>
          <span className="mt-1 text-[64px] font-extrabold leading-none tabular-nums">
            {fmt(remaining)}
          </span>
          <span className="mt-2 text-[13px] font-semibold opacity-75">
            Step {index + 1} of {spec.phases.length}
            {next ? ` · next: ${next.label} ${fmt(next.seconds)}` : ""}
          </span>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2.5">
        {finished ? (
          <SheetButton
            onClick={() => {
              onDone();
              onClose();
            }}
          >
            Mark done
          </SheetButton>
        ) : (
          <>
            <SheetButton onClick={running ? pause : start}>
              {running ? "Pause" : index === 0 && remaining === phase?.seconds ? "Start" : "Resume"}
            </SheetButton>
            <div className="flex gap-2.5">
              <SheetButton variant="ghost" onClick={() => advance(index)}>
                Skip step
              </SheetButton>
              <SheetButton
                variant="ghost"
                onClick={() => {
                  onDone();
                  onClose();
                }}
              >
                Mark done
              </SheetButton>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
