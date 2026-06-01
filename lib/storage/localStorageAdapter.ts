import type { AppData } from "../types";
import type { StorageAdapter } from "./adapter";
import { CURRENT_VERSION } from "./adapter";
import { makeDefaultData } from "./defaults";

const STORAGE_KEY = "hypertrophy-tracker:data";

const KG_TO_LB = 2.20462;

// Apply any one-time data migrations needed to bring older saved data up to
// CURRENT_VERSION. Returns the (possibly updated) data.
function migrate(data: AppData): AppData {
  // v1 -> v2: the app switched from kg to lb. Convert the stored unit AND the
  // actual logged weights so historical lifts stay physically accurate
  // (e.g. 100 kg becomes ~220 lb, not a mislabeled 100 lb).
  if ((data.version ?? 1) < 2 && data.unit === "kg") {
    data = {
      ...data,
      unit: "lb",
      logs: data.logs.map((log) => ({
        ...log,
        weight: Math.round(log.weight * KG_TO_LB * 10) / 10,
      })),
    };
  }
  // v2 -> v3: introduced stamped workout sessions. Older data has no
  // `sessions` array — start it empty so the app can begin recording.
  if (!Array.isArray(data.sessions)) {
    data = { ...data, sessions: [] };
  }
  return { ...data, version: CURRENT_VERSION };
}

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
      return migrate(parsed);
    } catch {
      return makeDefaultData();
    }
  }

  async save(data: AppData): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
