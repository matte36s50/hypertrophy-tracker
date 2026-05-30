"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

  // Load saved data once, on the client.
  useEffect(() => {
    let active = true;
    getStorage()
      .load()
      .then((loaded) => {
        if (active) {
          setData(loaded);
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback(
    (next: AppData | ((prev: AppData) => AppData)) => {
      setData((prev) => {
        const value =
          typeof next === "function"
            ? (next as (p: AppData) => AppData)(prev)
            : next;
        // Persist in the background.
        void getStorage().save(value);
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
