"use client";

import { useEffect, useState } from "react";

// User-supplied exercise images, stored on-device in IndexedDB (localStorage
// is too small for photos). Each entry holds 1–2 image sources: either a data
// URL from an upload (resized first) or a pasted http(s) URL.

const DB_NAME = "hypertrophy-tracker-images";
const STORE = "exercise-images";
const MAX_EDGE = 800;

export type CustomImages = Record<string, string[]>;

// One shared connection, opened on first use (retried if opening fails).
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).catch((err) => {
    dbPromise = null;
    throw err;
  });
  return dbPromise;
}

async function tx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req ? req.result : undefined);
    t.onerror = () => reject(t.error);
  });
}

// Tiny pub/sub so every mounted hook refreshes after a change.
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export async function loadCustomImages(): Promise<CustomImages> {
  if (typeof indexedDB === "undefined") return {};
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const out: CustomImages = {};
    const req = db.transaction(STORE).objectStore(STORE).openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return resolve(out);
      out[String(cursor.key)] = cursor.value as string[];
      cursor.continue();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomImages(
  exerciseId: string,
  srcs: string[],
): Promise<void> {
  await tx("readwrite", (s) => s.put(srcs.slice(0, 2), exerciseId));
  notify();
}

export async function deleteCustomImages(exerciseId: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(exerciseId));
  notify();
}

// Downscale an uploaded image to a JPEG data URL so storage stays small.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image"));
    };
    img.src = url;
  });
}

export function useCustomImages(): CustomImages {
  const [images, setImages] = useState<CustomImages>({});
  useEffect(() => {
    let active = true;
    const refresh = () =>
      loadCustomImages()
        .then((m) => active && setImages(m))
        .catch(() => {});
    refresh();
    listeners.add(refresh);
    return () => {
      active = false;
      listeners.delete(refresh);
    };
  }, []);
  return images;
}
