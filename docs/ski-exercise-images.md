# Pre-Ski exercise images

Generated from `lib/ski/exercises.ts`. Images are bundled under `public/exercise-images/<dataset id>/{0,1}.jpg` (start / end position), resized to 640 px wide. None are hot-linked, and none come from Carv's PDF.

**Source:** [free-exercise-db](https://github.com/yuhonas/free-exercise-db) by yuhonas, released under the **Unlicense** (public-domain dedication, checked in its `LICENSE.md`).

- **exact**: the dataset image shows the same movement.
- **similar**: the same movement pattern with a different implement or a missing detail. The app labels these "Similar: …" under the image.
- **placeholder**: no suitable image. The app shows the cue text plus a "Watch form" link to a YouTube search for `<name> form`. Every exercise has that link.

Add your own image for any exercise from **Ski → Exercise images**. It's stored on-device in IndexedDB.

| Exercise | Result | Source image (free-exercise-db) |
|---|---|---|
| Pelvic Tilt | placeholder | none: YouTube search link |
| Dead Bug | exact | Dead Bug (`Dead_Bug`) |
| Bird Dog | placeholder | none: YouTube search link |
| Thoracic Spine Rotation | placeholder | none: YouTube search link |
| 90/90s with Hip Lift | placeholder | none: YouTube search link |
| Half-Kneeling Ankle Dorsiflexion | placeholder | none: YouTube search link |
| World's Greatest Stretch | exact | World's Greatest Stretch (`Worlds_Greatest_Stretch`) |
| Calf Raises | similar | Standing Dumbbell Calf Raise (`Standing_Dumbbell_Calf_Raise`) |
| Standing Hip Circles | exact | Standing Hip Circles (`Standing_Hip_Circles`) |
| Lateral Lunge to Curtsy Lunge | placeholder | none: YouTube search link |
| High Plank Shoulder Taps | placeholder | none: YouTube search link |
| Pogo Jumps | placeholder | none: YouTube search link |
| Broad Jump with Back-Pedal | similar | Standing Long Jump (`Standing_Long_Jump`) |
| Depth Drop | placeholder | none: YouTube search link |
| Goblet Squat | exact | Goblet Squat (`Goblet_Squat`) |
| Kettlebell Suitcase Carry | similar | Farmer's Walk (`Farmers_Walk`) |
| Kettlebell Lateral Lunge | placeholder | none: YouTube search link |
| Kettlebell Single-Arm Row | exact | One-Arm Kettlebell Row (`One-Arm_Kettlebell_Row`) |
| Dumbbell Step-Up | exact | Dumbbell Step Ups (`Dumbbell_Step_Ups`) |
| Single-Arm DB Overhead Press | exact | Dumbbell One-Arm Shoulder Press (`Dumbbell_One-Arm_Shoulder_Press`) |
| Hollow Body Hold | placeholder | none: YouTube search link |
| Half-Kneeling Landmine Press | placeholder | none: YouTube search link |
| Pallof Press | exact | Pallof Press (`Pallof_Press`) |
| Plank with Plate Pull-Through | placeholder | none: YouTube search link |
| Deadlift | exact | Barbell Deadlift (`Barbell_Deadlift`) |
| Single-Leg RDL | similar | Kettlebell One-Legged Deadlift (`Kettlebell_One-Legged_Deadlift`) |
| Dumbbell Biceps Curl | exact | Dumbbell Bicep Curl (`Dumbbell_Bicep_Curl`) |
| Bulgarian Split Squat | exact | Split Squat with Dumbbells (`Split_Squat_with_Dumbbells`) |
| Copenhagen Plank | placeholder | none: YouTube search link |
| Back-Rack Reverse Lunge | similar | Dumbbell Rear Lunge (`Dumbbell_Rear_Lunge`) |
| Kettlebell Overhead Waiter's Carry | placeholder | none: YouTube search link |
| Barbell RDL | exact | Romanian Deadlift (`Romanian_Deadlift`) |
| Dumbbell Lateral Raise | exact | Side Lateral Raise (`Side_Lateral_Raise`) |
| Poliquin Step-Down | placeholder | none: YouTube search link |
| Calf Raises (KB Farmer's Hold) | similar | Standing Dumbbell Calf Raise (`Standing_Dumbbell_Calf_Raise`) |
| Landmine Curtsy Lunge | placeholder | none: YouTube search link |
| Push-Ups | exact | Pushups (`Pushups`) |
| Depth Drop to Vertical Jump | similar | Linear Depth Jump (`Linear_Depth_Jump`) |
| Single-Leg Broad Jump | similar | Single-Leg Hop Progression (`Single-Leg_Hop_Progression`) |
| Box Jumps | exact | Front Box Jump (`Front_Box_Jump`) |
| Lateral Single-Leg Hops | exact | Single-Leg Lateral Hop (`Single-Leg_Lateral_Hop`) |
| Sprint Intervals | similar | Running, Treadmill (`Running_Treadmill`) |
| Broad Jump to Vertical Jump | similar | Standing Long Jump (`Standing_Long_Jump`) |
| Squat Jump | exact | Freehand Jump Squat (`Freehand_Jump_Squat`) |
| Lateral Medicine Ball Toss | placeholder | none: YouTube search link |
| Kettlebell Swings | similar | One-Arm Kettlebell Swings (`One-Arm_Kettlebell_Swings`) |
| Conditioning Intervals | similar | Running, Treadmill (`Running_Treadmill`) |
| Agility Ladder | placeholder | none: YouTube search link |
| Zone 2 Cardio | similar | Jogging, Treadmill (`Jogging_Treadmill`) |
| Calf Raises (3s lower) *(knee-friendly sub)* | similar | Standing Dumbbell Calf Raise (`Standing_Dumbbell_Calf_Raise`) |
| Tempo Goblet Squat to Box *(knee-friendly sub)* | similar | Goblet Squat (`Goblet_Squat`) |
| Step-Down from Low Step *(knee-friendly sub)* | placeholder | none: YouTube search link |
| Bodyweight Step-Up *(knee-friendly sub)* | similar | Dumbbell Step Ups (`Dumbbell_Step_Ups`) |
| Lateral Band Walks *(knee-friendly sub)* | similar | Monster Walk (`Monster_Walk`) |
| Bike / Rower Intervals *(knee-friendly sub)* | similar | Bicycling, Stationary (`Bicycling_Stationary`) |

**Totals:** 17 exact · 18 similar · 20 placeholder (55 exercises).
