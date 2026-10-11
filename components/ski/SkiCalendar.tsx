"use client";

import { useRef, useState } from "react";
import type { SkiProgram } from "@/lib/ski/types";
import {
  PROGRAM_DAYS,
  dateForIndex,
  fromDateKey,
  isStrength,
  sessionOn,
  strengthConflicts,
} from "@/lib/ski/program";
import { DAY_KIND_SHORT } from "@/lib/ski/sessions";

// 6-week grid (one row per program week). In `rearrange` mode, sessions on
// upcoming days can be dragged onto another day — or tapped, then tapped
// again on the target — to swap them. Touch scrolling is only blocked while
// rearranging.
export function SkiCalendar({
  program,
  todayIndex,
  rearrange = false,
  onOpenDay,
  onMove,
}: {
  program: SkiProgram;
  todayIndex: number;
  rearrange?: boolean;
  onOpenDay?: (index: number) => void;
  onMove?: (from: number, to: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragFrom = useRef<number | null>(null);
  const conflicts = new Set(strengthConflicts(program.schedule).flat());

  const movable = (i: number) =>
    i >= todayIndex && !sessionOn(program, dateForIndex(program, i));

  function indexAt(x: number, y: number): number | null {
    const el = document.elementFromPoint(x, y)?.closest("[data-day]");
    return el ? Number(el.getAttribute("data-day")) : null;
  }

  function release(i: number, x: number, y: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragOver(null);
    if (!rearrange) {
      onOpenDay?.(i);
      return;
    }
    const target = indexAt(x, y);
    if (from !== null && target !== null && target !== from && movable(target)) {
      onMove?.(from, target);
      setSelected(null);
      return;
    }
    // Tap-to-move: first tap selects, second tap on another day swaps.
    if (selected === null) {
      if (movable(i)) setSelected(i);
    } else if (selected === i) {
      setSelected(null);
    } else if (movable(i)) {
      onMove?.(selected, i);
      setSelected(null);
    }
  }

  return (
    <div>
      <div className="mb-1.5 grid grid-cols-[30px_repeat(7,1fr)] gap-1 text-center text-[10.5px] font-bold uppercase text-text-3">
        <span />
        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
          <span key={d}>D{d}</span>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {Array.from({ length: PROGRAM_DAYS / 7 }, (_, w) => (
          <div key={w} className="grid grid-cols-[30px_repeat(7,1fr)] gap-1">
            <span className="flex items-center text-[11px] font-bold text-text-3">
              W{w + 1}
            </span>
            {Array.from({ length: 7 }, (_, d) => {
              const i = w * 7 + d;
              const kind = program.schedule[i];
              const date = dateForIndex(program, i);
              const done = Boolean(sessionOn(program, date));
              const past = i < todayIndex;
              const isToday = i === todayIndex;
              const strength = isStrength(kind);
              const conflict = conflicts.has(i);
              const sel = selected === i;
              return (
                <button
                  key={i}
                  type="button"
                  data-day={i}
                  onPointerDown={(e) => {
                    if (rearrange && movable(i)) {
                      dragFrom.current = i;
                      e.currentTarget.releasePointerCapture?.(e.pointerId);
                    }
                  }}
                  onPointerMove={(e) => {
                    if (dragFrom.current !== null) setDragOver(indexAt(e.clientX, e.clientY));
                  }}
                  onPointerUp={(e) => release(i, e.clientX, e.clientY)}
                  style={{ touchAction: rearrange ? "none" : "auto" }}
                  className={`relative flex h-[54px] flex-col items-center justify-center rounded-[10px] border text-center leading-tight ${
                    conflict
                      ? "border-bad bg-bad/10"
                      : sel || dragOver === i
                        ? "border-accent bg-accent-soft"
                        : done
                          ? "border-accent bg-accent text-accent-contrast"
                          : kind === "rest"
                            ? "border-border bg-surface-2"
                            : strength
                              ? "border-border-strong bg-surface"
                              : "border-border bg-surface"
                  } ${isToday ? "ring-2 ring-accent ring-offset-1" : ""} ${
                    past && !done ? "opacity-50" : ""
                  } ${rearrange && !movable(i) ? "opacity-40" : ""}`}
                >
                  <span
                    className={`text-[10px] font-semibold ${done ? "text-accent-contrast/80" : "text-text-3"}`}
                  >
                    {fromDateKey(date).getDate()}
                  </span>
                  <span
                    className={`text-[11.5px] font-extrabold ${
                      done ? "" : kind === "rest" ? "text-text-3" : "text-text"
                    }`}
                  >
                    {DAY_KIND_SHORT[kind]}
                  </span>
                  {done && <span className="text-[9px] font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
