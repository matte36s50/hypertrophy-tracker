import type { AppData } from "../types";
import type { StorageAdapter } from "./adapter";
import { makeDefaultData } from "./defaults";

const STORAGE_KEY = "hypertrophy-tracker:data";

// Stores everything in the browser's localStorage. No backend, no login.
// All data stays on the device.
export class LocalStorageAdapter implements StorageAdapter {
  async load(): Promise<AppData> {
    if (typeof window === "undefined") {
      // Running on the server (e.g. during build) — return defaults.
      return makeDefaultData();
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return makeDefaultData();
      const parsed = JSON.parse(raw) as AppData;
      // Light validation: if the shape looks wrong, start fresh.
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.split)) {
        return makeDefaultData();
      }
      return parsed;
    } catch {
      return makeDefaultData();
    }
  }

  async save(data: AppData): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
