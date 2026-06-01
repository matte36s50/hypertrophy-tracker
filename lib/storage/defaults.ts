import type { AppData } from "../types";
import { DEFAULT_SPLIT } from "../split";
import { CURRENT_VERSION } from "./adapter";

// A brand-new, empty data set for a first-time user.
export function makeDefaultData(): AppData {
  return {
    version: CURRENT_VERSION,
    unit: "lb",
    // Deep-copy the default split so user edits don't mutate the constant.
    split: JSON.parse(JSON.stringify(DEFAULT_SPLIT)),
    logs: [],
  };
}
