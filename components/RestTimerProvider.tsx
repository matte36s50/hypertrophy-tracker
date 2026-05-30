"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Sensible default rest for hypertrophy work (2.5 min). Adjustable live.
export const DEFAULT_REST_SECONDS = 150;

interface RestTimerValue {
  // Seconds remaining (0 when idle or finished).
  remaining: number;
  active: boolean;
  finished: boolean;
  start: (seconds?: number) => void;
  addSeconds: (delta: number) => void;
  skip: () => void;
}

const RestTimerContext = createContext<RestTimerValue | null>(null);

export function RestTimerProvider({ children }: { children: React.ReactNode }) {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [finished, setFinished] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  // Lazily create an AudioContext on a user gesture so we can beep later.
  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) audioRef.current = new Ctx();
    }
    return audioRef.current;
  }, []);

  const beep = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    try {
      void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      /* ignore audio failures */
    }
  }, []);

  const start = useCallback(
    (seconds: number = DEFAULT_REST_SECONDS) => {
      ensureAudio();
      setFinished(false);
      setEndAt(Date.now() + seconds * 1000);
      setRemaining(seconds);
    },
    [ensureAudio],
  );

  const addSeconds = useCallback(
    (delta: number) => {
      setEndAt((prev) => {
        const base = prev ?? Date.now();
        const next = Math.max(Date.now(), base + delta * 1000);
        setRemaining(Math.round((next - Date.now()) / 1000));
        return next;
      });
      setFinished(false);
    },
    [],
  );

  const skip = useCallback(() => {
    setEndAt(null);
    setRemaining(0);
    setFinished(false);
  }, []);

  // Tick while active. Uses an absolute end time so backgrounding stays accurate.
  useEffect(() => {
    if (endAt === null) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setEndAt(null);
        setFinished(true);
        beep();
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.([200, 100, 200]);
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [endAt, beep]);

  // Auto-clear the "finished" banner after a few seconds.
  useEffect(() => {
    if (!finished) return;
    const id = setTimeout(() => setFinished(false), 6000);
    return () => clearTimeout(id);
  }, [finished]);

  return (
    <RestTimerContext.Provider
      value={{
        remaining,
        active: endAt !== null,
        finished,
        start,
        addSeconds,
        skip,
      }}
    >
      {children}
    </RestTimerContext.Provider>
  );
}

export function useRestTimer(): RestTimerValue {
  const ctx = useContext(RestTimerContext);
  if (!ctx) throw new Error("useRestTimer must be used inside <RestTimerProvider>");
  return ctx;
}
