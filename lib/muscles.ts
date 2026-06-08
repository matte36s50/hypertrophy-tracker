import type { MuscleGroup, VolumeLandmarks } from "./types";

// Human-friendly names for each muscle group.
export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  "front-delts": "Front Delts",
  "side-delts": "Side Delts",
  "rear-delts": "Rear Delts",
  triceps: "Triceps",
  back: "Back (Mid/Upper)",
  lats: "Lats",
  biceps: "Biceps",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
};

// RP-style weekly volume landmarks (working sets per week). These are
// reasonable defaults drawn from Renaissance Periodization guidance and can be
// tuned per person later. MAV here is a practical mid-range target.
export const VOLUME_LANDMARKS: Record<MuscleGroup, VolumeLandmarks> = {
  chest: { mev: 10, mav: 16, mrv: 22 },
  "front-delts": { mev: 6, mav: 10, mrv: 16 },
  "side-delts": { mev: 8, mav: 16, mrv: 26 },
  "rear-delts": { mev: 6, mav: 12, mrv: 20 },
  triceps: { mev: 8, mav: 14, mrv: 20 },
  back: { mev: 10, mav: 16, mrv: 22 },
  lats: { mev: 10, mav: 16, mrv: 22 },
  biceps: { mev: 8, mav: 14, mrv: 20 },
  quads: { mev: 8, mav: 14, mrv: 20 },
  hamstrings: { mev: 6, mav: 12, mrv: 18 },
  glutes: { mev: 4, mav: 10, mrv: 16 },
  // Calves recover quickly and are very commonly under-stimulated, so current
  // practice leans toward the higher end of the RP range — push MAV/MRV up a
  // touch and train them frequently (they tolerate 2–3×/week well).
  calves: { mev: 8, mav: 16, mrv: 22 },
};

// All muscle groups in a sensible display order.
export const MUSCLE_ORDER: MuscleGroup[] = [
  "chest",
  "front-delts",
  "side-delts",
  "rear-delts",
  "triceps",
  "back",
  "lats",
  "biceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
];
