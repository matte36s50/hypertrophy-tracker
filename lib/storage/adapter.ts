import type { AppData } from "../types";

// The StorageAdapter is the single "contract" the rest of the app talks to.
// Today it's backed by localStorage. Later we can write a SupabaseAdapter that
// implements the same interface and swap it in (in ./index.ts) WITHOUT changing
// any screen or component code. That's the key to adding cloud sync later
// without a rewrite.
export interface StorageAdapter {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
}

export const CURRENT_VERSION = 2;
