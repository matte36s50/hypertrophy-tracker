import type { ImageSource, SkiEquipment, SkiExercise } from "./types";

// Exercise catalogue for the Pre-Ski Season program (Carv pre-season plan by
// Katie White). Cues are short paraphrases for the app, not copied text.
//
// Demo images are bundled under /public/exercise-images — never hot-linked:
//  - free-exercise-db (github.com/yuhonas/free-exercise-db, Unlicense / public
//    domain): <dataset id>/{0,1}.jpg, start and end position.
//  - wger (wger.de), for gaps it covers better: wger-<id>/0.jpg, resized and
//    flattened to JPEG. These are CC BY-SA 4.0, so each one carries a credit
//    (author, license, source) that the app shows under the image.
// Exercises neither covers show a placeholder card with the cue text plus a
// YouTube form search. See docs/ski-exercise-images.md.

export function youtubeSearch(name: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${name} form`,
  )}`;
}

const CC_BY_SA_4 = {
  name: "CC BY-SA 4.0",
  url: "https://creativecommons.org/licenses/by-sa/4.0/",
};

// Helper: build an exercise, deriving image URLs + video link.
//  img:  free-exercise-db [id, name, match]
//  wger: wger [exercise id, name, author ("" if none given), match]
function ex(
  e: Omit<SkiExercise, "imageUrls" | "videoUrl" | "imageSource"> & {
    img?: [id: string, name: string, match: ImageSource["match"]];
    wger?: [id: number, name: string, author: string, match: ImageSource["match"]];
  },
): SkiExercise {
  const { img, wger, ...rest } = e;
  let imageUrls: string[] = [];
  let imageSource: ImageSource | undefined;
  if (wger) {
    const [id, name, author, match] = wger;
    imageUrls = [`/exercise-images/wger-${id}/0.jpg`];
    imageSource = {
      dataset: "wger",
      id: String(id),
      name,
      match,
      credit: {
        author: author || "wger contributors",
        license: CC_BY_SA_4,
        sourceUrl: `https://wger.de/en/exercise/${id}/view/`,
      },
    };
  } else if (img) {
    imageUrls = [`/exercise-images/${img[0]}/0.jpg`, `/exercise-images/${img[0]}/1.jpg`];
    imageSource = { dataset: "free-exercise-db", id: img[0], name: img[1], match: img[2] };
  }
  return { ...rest, imageUrls, videoUrl: youtubeSearch(e.name), imageSource };
}

const BW: SkiEquipment[] = ["bodyweight"];
const MAT: SkiEquipment[] = ["mat"];

export const SKI_EXERCISES: SkiExercise[] = [
  // ---- Daily warm-up ----
  ex({
    id: "pelvic-tilt",
    name: "Pelvic Tilt",
    cue: "Lie on your back, knees bent. Small, controlled tilt — flatten then arch the low back. Don't push through your feet.",
    equipment: MAT,
    load: "bodyweight",
    tracking: "reps",
  }),
  ex({
    id: "dead-bug",
    name: "Dead Bug",
    cue: "Low back stays pressed into the floor while opposite arm and leg lower.",
    equipment: MAT,
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    easier: "Move one limb at a time",
    harder: "Lower the leg further, or hold a light dumbbell",
    img: ["Dead_Bug", "Dead Bug", "exact"],
  }),
  ex({
    id: "bird-dog",
    name: "Bird Dog",
    cue: "On all fours, reach opposite arm and leg long. Hips stay level — no rocking.",
    equipment: MAT,
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    wger: [1572, "Bird Dog", "Settebello", "exact"],
  }),
  ex({
    id: "tspine-rotation",
    name: "Thoracic Spine Rotation",
    cue: "Rotate from the upper back; hips stay still.",
    equipment: MAT,
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
  }),
  ex({
    id: "ninety-ninety-hip-lift",
    name: "90/90s with Hip Lift",
    cue: "Rotate knees side to side in a 90/90 sit, then lift the hips. Slow, no momentum.",
    equipment: MAT,
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    easier: "Skip the hip lift",
    harder: "Hold the top of the lift for 2s",
  }),
  ex({
    id: "ankle-dorsiflexion",
    name: "Half-Kneeling Ankle Dorsiflexion",
    cue: "Drive the front knee forward over the toes. Heel stays down; knee doesn't cave in.",
    equipment: MAT,
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    kneeLoading: true,
    wger: [1804, "ankle dorsiflexion rocks", "Davidgj32", "exact"],
  }),
  ex({
    id: "worlds-greatest-stretch",
    name: "World's Greatest Stretch",
    cue: "Long lunge, elbow drops to the instep, then rotate and reach up.",
    equipment: BW,
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    easier: "Back knee down, or skip the elbow drop",
    img: ["Worlds_Greatest_Stretch", "World's Greatest Stretch", "exact"],
  }),
  ex({
    id: "calf-raise-bw",
    name: "Calf Raises",
    cue: "Full range up and down. No bouncing.",
    equipment: BW,
    load: "bodyweight",
    tracking: "reps",
    harder: "Single-leg, or off the edge of a step",
    img: ["Standing_Dumbbell_Calf_Raise", "Standing Dumbbell Calf Raise", "similar"],
  }),
  ex({
    id: "standing-hip-circles",
    name: "Standing Hip Circles",
    cue: "Big slow circles with the knee. Upper body still; hold a support if needed.",
    equipment: ["bodyweight", "support"],
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    img: ["Standing_Hip_Circles", "Standing Hip Circles", "exact"],
  }),
  ex({
    id: "lateral-to-curtsy-lunge",
    name: "Lateral Lunge to Curtsy Lunge",
    cue: "Side lunge, then step back into a curtsy. Knee tracks over the toes.",
    equipment: BW,
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    kneeLoading: true,
    easier: "Hold a support and go shallower",
  }),
  ex({
    id: "plank-shoulder-taps",
    name: "High Plank Shoulder Taps",
    cue: "Hips stay square while you tap the opposite shoulder.",
    equipment: MAT,
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    easier: "From the knees",
    harder: "Feet closer together",
    wger: [1091, "Plank Shoulder Taps", "clafal", "exact"],
  }),
  ex({
    id: "pogo-jumps",
    name: "Pogo Jumps",
    cue: "Small, quick, quiet bounces off the balls of the feet.",
    equipment: BW,
    load: "bodyweight",
    tracking: "timed",
    plyo: true,
    kneeLoading: true,
  }),
  ex({
    id: "broad-jump-backpedal",
    name: "Broad Jump with Back-Pedal",
    cue: "Jump forward, land soft and balanced, back-pedal to the start before the next rep.",
    equipment: BW,
    load: "bodyweight",
    tracking: "reps",
    plyo: true,
    kneeLoading: true,
    img: ["Standing_Long_Jump", "Standing Long Jump", "similar"],
  }),
  ex({
    id: "depth-drop",
    name: "Depth Drop",
    cue: "Step off (don't jump), absorb the landing, hold 1s.",
    equipment: ["step"],
    load: "bodyweight",
    tracking: "reps",
    plyo: true,
    kneeLoading: true,
    easier: "Use a lower step",
  }),

  // ---- Strength 1 ----
  ex({
    id: "goblet-squat",
    name: "Goblet Squat",
    cue: "Challenging load, clean form. Barbell front squat is an alternative.",
    equipment: ["dumbbell", "kettlebell"],
    load: "challenging",
    tracking: "load",
    kneeLoading: true,
    easier: "Squat to a box",
    harder: "3s lowering",
    img: ["Goblet_Squat", "Goblet Squat", "exact"],
  }),
  ex({
    id: "kb-suitcase-carry",
    name: "Kettlebell Suitcase Carry",
    cue: "Heavy bell in one hand. Stay tall — don't lean toward or away from it.",
    equipment: ["kettlebell"],
    load: "heavy",
    tracking: "load",
    repsLabel: "lengths",
    perSide: true,
    img: ["Farmers_Walk", "Farmer's Walk", "similar"],
  }),
  ex({
    id: "kb-lateral-lunge",
    name: "Kettlebell Lateral Lunge",
    cue: "Bell held at the chest. Sit into the hip; knee tracks over the toes.",
    equipment: ["kettlebell"],
    load: "KB at chest",
    tracking: "load",
    perSide: true,
    kneeLoading: true,
    wger: [1604, "Sliding Lateral Lunge", "RiccaBaro", "exact"],
  }),
  ex({
    id: "kb-single-arm-row",
    name: "Kettlebell Single-Arm Row",
    cue: "Heavy. Pull to the hip without twisting the torso.",
    equipment: ["kettlebell", "step"],
    load: "heavy",
    tracking: "load",
    perSide: true,
    img: ["One-Arm_Kettlebell_Row", "One-Arm Kettlebell Row", "exact"],
  }),
  ex({
    id: "db-step-up",
    name: "Dumbbell Step-Up",
    cue: "Drive through the top leg; don't push off the back foot.",
    equipment: ["dumbbell", "step"],
    load: "moderate–heavy",
    tracking: "load",
    perSide: true,
    kneeLoading: true,
    img: ["Dumbbell_Step_Ups", "Dumbbell Step Ups", "exact"],
  }),
  ex({
    id: "sa-db-overhead-press",
    name: "Single-Arm DB Overhead Press",
    cue: "Ribs down, no leaning back.",
    equipment: ["dumbbell"],
    load: "moderate",
    tracking: "load",
    perSide: true,
    img: ["Dumbbell_One-Arm_Shoulder_Press", "Dumbbell One-Arm Shoulder Press", "exact"],
  }),
  ex({
    id: "hollow-body-hold",
    name: "Hollow Body Hold",
    cue: "Low back glued down, arms and legs long.",
    equipment: MAT,
    load: "bodyweight",
    tracking: "timed",
    easier: "Knees bent, arms crossed on the chest",
  }),
  ex({
    id: "half-kneeling-landmine-press",
    name: "Half-Kneeling Landmine Press",
    cue: "Press up and forward without rotating the torso.",
    equipment: ["landmine", "barbell", "mat"],
    load: "moderate",
    tracking: "load",
    perSide: true,
  }),

  // ---- Strength 2 ----
  ex({
    id: "pallof-press",
    name: "Pallof Press",
    cue: "Press straight out and resist the pull back to the anchor.",
    equipment: ["band", "cable"],
    load: "band or cable",
    tracking: "reps",
    perSide: true,
    easier: "Less tension (step closer to the anchor)",
    img: ["Pallof_Press", "Pallof Press", "exact"],
  }),
  ex({
    id: "plank-plate-pull-through",
    name: "Plank with Plate Pull-Through",
    cue: "High plank; drag the plate under the body. Hips stay still.",
    equipment: ["plate", "mat"],
    load: "moderate plate",
    tracking: "load",
    perSide: true,
  }),
  ex({
    id: "deadlift",
    name: "Deadlift",
    cue: "Barbell or heavy DBs. Heavy, but leave reps in reserve.",
    equipment: ["barbell", "dumbbell"],
    load: "heavy, reps in reserve",
    tracking: "load",
    easier: "Trap bar, or pull from a raised start",
    img: ["Barbell_Deadlift", "Barbell Deadlift", "exact"],
  }),
  ex({
    id: "single-leg-rdl",
    name: "Single-Leg RDL",
    cue: "DB in the opposite hand. Hips stay square to the floor.",
    equipment: ["dumbbell"],
    load: "DB, opposite hand",
    tracking: "load",
    perSide: true,
    img: ["Kettlebell_One-Legged_Deadlift", "Kettlebell One-Legged Deadlift", "similar"],
  }),
  ex({
    id: "db-biceps-curl",
    name: "Dumbbell Biceps Curl",
    cue: "Moderate weight, no swinging.",
    equipment: ["dumbbell"],
    load: "moderate",
    tracking: "load",
    img: ["Dumbbell_Bicep_Curl", "Dumbbell Bicep Curl", "exact"],
  }),
  ex({
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    cue: "DBs at the sides, rear foot elevated. Front knee doesn't cave in.",
    equipment: ["dumbbell", "step"],
    load: "DBs at sides",
    tracking: "load",
    perSide: true,
    kneeLoading: true,
    img: ["Split_Squat_with_Dumbbells", "Split Squat with Dumbbells", "exact"],
  }),
  ex({
    id: "copenhagen-plank",
    name: "Copenhagen Plank",
    cue: "Side plank with the top foot on a bench; lift the bottom leg up to meet it.",
    equipment: ["step", "mat"],
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    easier: "Top knee on the bench instead of the foot",
  }),

  // ---- Strength 3 ----
  ex({
    id: "back-rack-reverse-lunge",
    name: "Back-Rack Reverse Lunge",
    cue: "Barbell on the back or heavy DBs. Step back, front shin stays fairly vertical.",
    equipment: ["barbell", "dumbbell"],
    load: "barbell or heavy DBs",
    tracking: "load",
    perSide: true,
    kneeLoading: true,
    img: ["Dumbbell_Rear_Lunge", "Dumbbell Rear Lunge", "similar"],
  }),
  ex({
    id: "kb-waiters-carry",
    name: "Kettlebell Overhead Waiter's Carry",
    cue: "Bell locked out overhead, wrist stacked. Walk tall — no leaning.",
    equipment: ["kettlebell"],
    load: "moderate KB",
    tracking: "load",
    repsLabel: "lengths",
    perSide: true,
  }),
  ex({
    id: "barbell-rdl",
    name: "Barbell RDL",
    cue: "Heavy. Hinge at the hips — it's not a squat.",
    equipment: ["barbell"],
    load: "heavy",
    tracking: "load",
    img: ["Romanian_Deadlift", "Romanian Deadlift", "exact"],
  }),
  ex({
    id: "db-lateral-raise",
    name: "Dumbbell Lateral Raise",
    cue: "Light–moderate. No swinging or shrugging.",
    equipment: ["dumbbell"],
    load: "light–moderate",
    tracking: "load",
    img: ["Side_Lateral_Raise", "Side Lateral Raise", "exact"],
  }),
  ex({
    id: "poliquin-step-down",
    name: "Poliquin Step-Down",
    cue: "KB farmer's hold. Slow lower, tap the heel, knee tracks over the toes.",
    equipment: ["kettlebell", "step"],
    load: "KB farmer's hold",
    tracking: "load",
    perSide: true,
    kneeLoading: true,
  }),
  ex({
    id: "calf-raise-kb",
    name: "Calf Raises (KB Farmer's Hold)",
    cue: "Full range, no bouncing.",
    equipment: ["kettlebell"],
    load: "KB farmer's hold",
    tracking: "load",
    img: ["Standing_Dumbbell_Calf_Raise", "Standing Dumbbell Calf Raise", "similar"],
  }),
  ex({
    id: "landmine-curtsy-lunge",
    name: "Landmine Curtsy Lunge",
    cue: "Bar end held at the chest. Take a smaller step if the knee caves.",
    equipment: ["landmine", "barbell"],
    load: "bar at chest",
    tracking: "load",
    perSide: true,
    kneeLoading: true,
  }),
  ex({
    id: "push-ups",
    name: "Push-Ups",
    cue: "Body in one straight line, chest to the floor.",
    equipment: BW,
    load: "bodyweight",
    tracking: "reps",
    easier: "Hands on a bench, or from the knees",
    img: ["Pushups", "Pushups", "exact"],
  }),

  // ---- Power / Conditioning 1 ----
  ex({
    id: "depth-drop-vertical",
    name: "Depth Drop to Vertical Jump",
    cue: "Step off, land, and rebound straight up.",
    equipment: ["step", "box"],
    load: "bodyweight",
    tracking: "reps",
    plyo: true,
    kneeLoading: true,
    img: ["Linear_Depth_Jump", "Linear Depth Jump", "similar"],
  }),
  ex({
    id: "single-leg-broad-jump",
    name: "Single-Leg Broad Jump",
    cue: "Control over distance. Stick every landing.",
    equipment: BW,
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    plyo: true,
    kneeLoading: true,
    img: ["Single-Leg_Hop_Progression", "Single-Leg Hop Progression", "similar"],
  }),
  ex({
    id: "box-jump",
    name: "Box Jumps",
    cue: "Jump up, land soft, step down. Log the box height.",
    equipment: ["box"],
    load: "bodyweight",
    tracking: "height",
    loadLabel: "Box height",
    plyo: true,
    kneeLoading: true,
    img: ["Front_Box_Jump", "Front Box Jump", "exact"],
  }),
  ex({
    id: "lateral-sl-hops",
    name: "Lateral Single-Leg Hops",
    cue: "Hop side to side on one leg, quick and controlled.",
    equipment: BW,
    load: "bodyweight",
    tracking: "timed",
    perSide: true,
    plyo: true,
    kneeLoading: true,
    img: ["Single-Leg_Lateral_Hop", "Single-Leg Lateral Hop", "exact"],
  }),
  ex({
    id: "sprint-intervals",
    name: "Sprint Intervals",
    cue: "Straight after the plyos. Hard efforts are hard; recoveries are easy.",
    equipment: ["cardio"],
    load: "run (or bike / rower)",
    tracking: "intervals",
    plyo: true,
    kneeLoading: true,
    img: ["Running_Treadmill", "Running, Treadmill", "similar"],
  }),

  // ---- Power / Conditioning 2 ----
  ex({
    id: "broad-to-vertical",
    name: "Broad Jump to Vertical Jump",
    cue: "Broad jump, land, then immediately jump straight up.",
    equipment: BW,
    load: "bodyweight",
    tracking: "reps",
    plyo: true,
    kneeLoading: true,
    img: ["Standing_Long_Jump", "Standing Long Jump", "similar"],
  }),
  ex({
    id: "squat-jump",
    name: "Squat Jump",
    cue: "Quarter-to-half squat, explode up, land soft.",
    equipment: BW,
    load: "bodyweight",
    tracking: "reps",
    plyo: true,
    kneeLoading: true,
    img: ["Freehand_Jump_Squat", "Freehand Jump Squat", "exact"],
  }),
  ex({
    id: "lateral-med-ball-toss",
    name: "Lateral Medicine Ball Toss",
    cue: "Power from the floor up — legs, hips, then arms. Throw against a wall.",
    equipment: ["med-ball"],
    load: "moderate med ball",
    tracking: "load",
    perSide: true,
  }),
  ex({
    id: "kb-swing",
    name: "Kettlebell Swings",
    cue: "Challenging bell, clean form. Hinge — it's not a squat.",
    equipment: ["kettlebell"],
    load: "challenging",
    tracking: "load",
    wger: [960, "Kettlebell Swing", "", "exact"],
  }),
  ex({
    id: "conditioning-intervals",
    name: "Conditioning Intervals",
    cue: "Hard efforts at ~80%. Bike or rower works too.",
    equipment: ["cardio"],
    load: "run (or bike / rower)",
    tracking: "intervals",
    plyo: true,
    kneeLoading: true,
    img: ["Running_Treadmill", "Running, Treadmill", "similar"],
  }),

  // ---- Endurance ----
  ex({
    id: "agility-ladder",
    name: "Agility Ladder",
    cue: "Accuracy before speed. Both sides where relevant.",
    equipment: ["ladder"],
    load: "bodyweight",
    tracking: "ladder",
  }),
  ex({
    id: "zone2",
    name: "Zone 2 Cardio",
    cue: "30–45 min steady at a conversational pace: jog, bike, brisk or uphill walk, swim, elliptical or stair-stepper.",
    equipment: ["cardio"],
    load: "steady, conversational",
    tracking: "cardio",
    img: ["Jogging_Treadmill", "Jogging, Treadmill", "similar"],
  }),

  // ---- Knee-friendly substitutes ----
  ex({
    id: "ko-calf-raise-tempo",
    name: "Calf Raises (3s lower)",
    cue: "Rise up, then take a slow 3-second lower. No bouncing.",
    equipment: BW,
    load: "bodyweight",
    tracking: "reps",
    img: ["Standing_Dumbbell_Calf_Raise", "Standing Dumbbell Calf Raise", "similar"],
  }),
  ex({
    id: "ko-goblet-box-squat",
    name: "Tempo Goblet Squat to Box",
    cue: "3-second lower to a box, light touch, stand up smoothly.",
    equipment: ["dumbbell", "kettlebell", "box"],
    load: "light–moderate",
    tracking: "load",
    kneeLoading: true,
    img: ["Goblet_Squat", "Goblet Squat", "similar"],
  }),
  ex({
    id: "ko-step-down",
    name: "Step-Down from Low Step",
    cue: "Low step. 3-second lower, land quietly and hold the landing.",
    equipment: ["step"],
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    kneeLoading: true,
  }),
  ex({
    id: "ko-bw-step-up",
    name: "Bodyweight Step-Up",
    cue: "Controlled up and down; no push-off from the back foot.",
    equipment: ["step"],
    load: "bodyweight",
    tracking: "reps",
    perSide: true,
    kneeLoading: true,
    img: ["Dumbbell_Step_Ups", "Dumbbell Step Ups", "similar"],
  }),
  ex({
    id: "ko-lateral-band-walk",
    name: "Lateral Band Walks",
    cue: "Band above the knees, half-squat, step sideways. Knees push out.",
    equipment: ["band"],
    load: "band",
    tracking: "reps",
    perSide: true,
    wger: [2618, "Hip-Out and Hip-In Lateral Steps", "", "exact"],
  }),
  ex({
    id: "ko-bike-intervals",
    name: "Bike / Rower Intervals",
    cue: "Same timing as the run, on a bike or rower.",
    equipment: ["cardio"],
    load: "bike or rower",
    tracking: "intervals",
    img: ["Bicycling_Stationary", "Bicycling, Stationary", "similar"],
  }),
];

const BY_ID = new Map(SKI_EXERCISES.map((e) => [e.id, e]));

export function getSkiExercise(id: string): SkiExercise | undefined {
  return BY_ID.get(id);
}

export const EQUIPMENT_LABELS: Record<SkiEquipment, string> = {
  bodyweight: "Bodyweight",
  dumbbell: "Dumbbells",
  kettlebell: "Kettlebell",
  barbell: "Barbell",
  landmine: "Landmine",
  plate: "Plate",
  step: "Step / bench",
  box: "Box",
  mat: "Mat",
  band: "Band",
  cable: "Cable",
  "med-ball": "Med ball",
  ladder: "Agility ladder",
  support: "Support",
  cardio: "Cardio",
};

// The 9 agility-ladder patterns. `hop` patterns are plyometric and are dropped
// (step patterns only) in knee-friendly mode.
export const LADDER_PATTERNS: { id: string; name: string; hop: boolean }[] = [
  { id: "fwd-hop-both", name: "Forward hops, both feet", hop: true },
  { id: "fwd-hop-one", name: "Forward hops, one foot", hop: true },
  { id: "fwd-step-through", name: "Forward step-through", hop: false },
  { id: "lat-step-through", name: "Lateral step-through", hop: false },
  { id: "lat-hop-both", name: "Lateral hops, both feet", hop: true },
  { id: "lat-hop-one", name: "Lateral hops, one foot", hop: true },
  { id: "lat-carioca", name: "Lateral carioca", hop: false },
  { id: "lat-in-in-out-out", name: "Lateral in-in-out-out", hop: false },
  { id: "fwd-in-in-out", name: "Forward in-in-out", hop: false },
];
