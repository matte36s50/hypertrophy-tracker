"use client";

import { useState } from "react";
import type { SkiExercise } from "@/lib/ski/types";
import { useCustomImages } from "@/lib/ski/customImages";

// Visual demo for a ski exercise: the user's own image if they added one,
// otherwise the bundled free-exercise-db pair (start / end), otherwise a
// placeholder card with the cue text. Always offers a YouTube form search.
export function ExerciseDemo({
  exercise,
  compact = false,
}: {
  exercise: SkiExercise;
  compact?: boolean;
}) {
  const custom = useCustomImages()[exercise.id];
  const srcs = custom?.length ? custom : exercise.imageUrls;
  const source = custom?.length ? undefined : exercise.imageSource;
  const credit = source?.credit;
  const [frame, setFrame] = useState(0);
  const src = srcs[Math.min(frame, srcs.length - 1)];

  return (
    <div className="overflow-hidden rounded-row border border-border bg-surface-2">
      {src ? (
        <button
          type="button"
          onClick={() => setFrame((f) => (f + 1) % srcs.length)}
          className="relative block w-full"
          aria-label="Show the other position"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${exercise.name} — ${frame === 0 ? "start" : "end"} position`}
            className={`w-full bg-white object-contain ${compact ? "aspect-[16/7]" : "aspect-video"}`}
            loading="lazy"
          />
          {srcs.length > 1 && (
            <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-bold text-white">
              {frame === 0 ? "Start" : "End"} · tap to flip
            </span>
          )}
        </button>
      ) : (
        <div className="flex flex-col gap-1.5 px-3.5 py-3">
          <span className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-text-3">
            No photo in the free exercise library
          </span>
          <p className="text-[13.5px] font-medium leading-snug text-text-2">
            {exercise.cue}
          </p>
          <p className="text-[12px] font-medium text-text-3">
            Tap “Watch form” for a video, or add your own photo under Ski →
            Exercise images.
          </p>
        </div>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-border px-3.5 py-2">
        <span className="min-w-0 truncate text-[11.5px] font-semibold text-text-3">
          {custom?.length
            ? "Your image"
            : source
              ? `${source.match === "similar" ? "Similar: " : ""}${source.name} · ${source.dataset}`
              : "Placeholder"}
        </span>
        <a
          href={exercise.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[12.5px] font-bold text-accent-text"
        >
          Watch form ↗
        </a>
      </div>
      {credit && (
        <p className="border-t border-border px-3.5 py-1.5 text-[11px] font-medium leading-snug text-text-3">
          Image:{" "}
          <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
            {source!.name}
          </a>{" "}
          by {credit.author} on wger, resized ·{" "}
          <a href={credit.license.url} target="_blank" rel="noopener noreferrer" className="underline">
            {credit.license.name}
          </a>
        </p>
      )}
    </div>
  );
}
