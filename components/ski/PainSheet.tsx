"use client";

import { useState } from "react";
import { Sheet, SheetButton } from "@/components/Sheet";

// 0–10 knee-pain rating. When the rating trips a rule (`needsFlags`), asks
// which exercises to flag, pre-selecting the suggested ones.
export function PainSheet({
  title,
  prompt,
  initial,
  candidates,
  defaultFlagged,
  needsFlags,
  flagPrompt,
  onSave,
  onClose,
}: {
  title: string;
  prompt: string;
  initial?: number;
  candidates: { id: string; name: string }[];
  defaultFlagged: string[];
  needsFlags: (rating: number) => boolean;
  flagPrompt: string;
  onSave: (rating: number, flagged: string[]) => void;
  onClose: () => void;
}) {
  const [rating, setRating] = useState<number | null>(initial ?? null);
  const [flagged, setFlagged] = useState<string[]>(defaultFlagged);
  const showFlags = rating !== null && needsFlags(rating) && candidates.length > 0;

  return (
    <Sheet title={title} onClose={onClose}>
      <p className="mb-3 text-[14px] font-medium text-text-2">{prompt}</p>
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 11 }, (_, v) => (
          <button
            key={v}
            type="button"
            onClick={() => setRating(v)}
            className={`press h-[46px] rounded-input border text-base font-extrabold tabular-nums ${
              rating === v
                ? v > 3
                  ? "border-bad bg-bad text-white"
                  : "border-accent bg-accent text-accent-contrast"
                : "border-border bg-surface-2 text-text-2"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11.5px] font-semibold text-text-3">
        <span>0 = none</span>
        <span>10 = worst</span>
      </div>

      {showFlags && (
        <div className="mt-4">
          <p className="mb-2 text-[14px] font-bold text-warn-text">{flagPrompt}</p>
          <div className="flex flex-col gap-1.5">
            {candidates.map((c) => {
              const on = flagged.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() =>
                    setFlagged((f) =>
                      on ? f.filter((x) => x !== c.id) : [...f, c.id],
                    )
                  }
                  className={`press flex items-center justify-between rounded-row border px-3.5 py-2.5 text-left text-[14px] font-semibold ${
                    on
                      ? "border-warn bg-warn/10 text-text"
                      : "border-border bg-surface-2 text-text-2"
                  }`}
                >
                  {c.name}
                  <span className="text-[12px] font-bold">{on ? "Flag" : ""}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-[18px]">
        <SheetButton
          onClick={() => rating !== null && onSave(rating, showFlags ? flagged : [])}
        >
          {rating === null ? "Pick a rating" : "Save rating"}
        </SheetButton>
      </div>
    </Sheet>
  );
}
