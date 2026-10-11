"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { IconChevron } from "@/components/icons";
import { ExerciseDemo } from "@/components/ski/ExerciseDemo";
import { EQUIPMENT_LABELS, SKI_EXERCISES } from "@/lib/ski/exercises";
import {
  deleteCustomImages,
  fileToDataUrl,
  saveCustomImages,
  useCustomImages,
} from "@/lib/ski/customImages";
import type { SkiEquipment } from "@/lib/ski/types";

// Admin: fill gaps in the exercise demos with your own photos (upload or
// paste a link). Stored on this device only. Also filters the catalogue by
// equipment so you can see what a session needs.
export default function SkiImagesPage() {
  const custom = useCustomImages();
  const [filter, setFilter] = useState<"all" | "missing" | SkiEquipment>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const equipment = Array.from(new Set(SKI_EXERCISES.flatMap((e) => e.equipment)));
  const list = SKI_EXERCISES.filter((e) =>
    filter === "all"
      ? true
      : filter === "missing"
        ? !e.imageUrls.length && !custom[e.id]?.length
        : e.equipment.includes(filter),
  );
  const missing = SKI_EXERCISES.filter((e) => !e.imageUrls.length && !custom[e.id]?.length).length;

  async function upload(id: string, files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    try {
      const srcs = await Promise.all(Array.from(files).slice(0, 2).map(fileToDataUrl));
      await saveCustomImages(id, srcs);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function addUrl(id: string) {
    const v = url.trim();
    if (!/^https?:\/\//i.test(v)) {
      setError("Paste a full http(s) image link.");
      return;
    }
    setError(null);
    await saveCustomImages(id, [...(custom[id] ?? []), v].slice(-2));
    setUrl("");
  }

  const chip = (key: typeof filter, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setFilter(key)}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-bold ${
        filter === key ? "border-accent bg-accent text-accent-contrast" : "border-border bg-surface text-text-2"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <Link href="/ski" className="mb-2 inline-flex items-center gap-1 text-[13px] font-bold text-text-3">
        <span className="rotate-180"><IconChevron s={13} /></span> Pre-Ski
      </Link>
      <PageHeader
        title="Exercise images"
        subtitle={`${missing} exercise${missing === 1 ? "" : "s"} still use a placeholder. Your images are stored on this device only.`}
      />
      <div className="-mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {chip("all", "All")}
        {chip("missing", "Needs image")}
        {equipment.map((eq) => chip(eq, EQUIPMENT_LABELS[eq]))}
      </div>

      <div className="flex flex-col gap-2.5">
        {list.map((e) => {
          const isOpen = open === e.id;
          const has = custom[e.id]?.length;
          return (
            <Card key={e.id} className="!p-3.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(isOpen ? null : e.id);
                  setError(null);
                }}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-[14.5px] font-extrabold">{e.name}</span>
                  <span className="text-[12px] font-medium text-text-3">
                    {has
                      ? "Your image"
                      : e.imageSource
                        ? `${e.imageSource.dataset} (${e.imageSource.match})`
                        : "Placeholder"}{" "}
                    · {e.equipment.map((q) => EQUIPMENT_LABELS[q]).join(", ")}
                  </span>
                </span>
                <span className={`transition-transform ${isOpen ? "rotate-90" : ""}`}>
                  <IconChevron s={15} />
                </span>
              </button>
              {isOpen && (
                <div className="mt-3 flex flex-col gap-2.5">
                  <ExerciseDemo exercise={e} />
                  <label className="press flex h-[44px] cursor-pointer items-center justify-center rounded-btn border border-border bg-surface-2 text-[14px] font-bold">
                    Upload 1–2 photos (start / end)
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(ev) => upload(e.id, ev.target.files)}
                    />
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(ev) => setUrl(ev.target.value)}
                      placeholder="…or paste an image link"
                      className="min-w-0 flex-1 rounded-input border border-border bg-surface-2 px-3 py-2.5 text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => addUrl(e.id)}
                      className="rounded-input bg-accent px-3.5 text-[14px] font-bold text-accent-contrast"
                    >
                      Add
                    </button>
                  </div>
                  {has ? (
                    <button
                      type="button"
                      onClick={() => deleteCustomImages(e.id)}
                      className="py-1 text-[13px] font-bold text-bad-text"
                    >
                      Remove my image{e.imageUrls.length ? " (back to bundled)" : ""}
                    </button>
                  ) : null}
                  {error && <p className="text-[13px] font-semibold text-bad-text">{error}</p>}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
