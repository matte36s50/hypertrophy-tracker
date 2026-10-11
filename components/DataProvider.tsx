"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { AppData } from "@/lib/types";
import { getStorage } from "@/lib/storage";
import { makeDefaultData } from "@/lib/storage/defaults";

interface DataContextValue {
  data: AppData;
  // Update data and persist it. Pass either a new object or an updater
  // function (like React's setState).
  update: (next: AppData | ((prev: AppData) => AppData)) => void;
  ready: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => makeDefaultData());
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Load saved data once, on the client.
  useEffect(() => {
    let active = true;
    getStorage()
      .load()
      .then((saved) => {
        if (active) {
          loaded.current = true;
          setData(saved);
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(
    (next: AppData | ((prev: AppData) => AppData)) => {
      // Ignore edits until saved data has loaded: applying them to the
      // placeholder defaults and saving would overwrite the real data.
      if (!loaded.current) return;
      setData((prev) => {
        const value =
          typeof next === "function"
            ? (next as (p: AppData) => AppData)(prev)
            : next;
        // Persist in the background. A failed write (storage full, private
        // mode) must not crash the app, but shouldn't be silent either.
        getStorage()
          .save(value)
          .catch((err) => console.warn("Couldn't save your data:", err));
        return value;
      });
    },
    [],
  );

  return (
    <DataContext.Provider value={{ data, update, ready }}>
      {children}
    </DataContext.Provider>
  );
}

export function useAppData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useAppData must be used inside <DataProvider>");
  }
  return ctx;
}
