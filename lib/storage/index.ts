import type { StorageAdapter } from "./adapter";
import { LocalStorageAdapter } from "./localStorageAdapter";

// The single place that decides WHICH storage backend the app uses.
// To add cloud sync later, write a SupabaseAdapter implementing StorageAdapter
// and return it here (e.g. based on whether the user is logged in). Nothing
// else in the app needs to change.
let adapter: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!adapter) {
    adapter = new LocalStorageAdapter();
  }
  return adapter;
}

export type { StorageAdapter };
