# Pre-Ski exercise images

Generated from `lib/ski/exercises.ts`. Every image is bundled under `public/exercise-images/`. None are hot-linked, and none come from Carv's PDF.

## Sources

- **[free-exercise-db](https://github.com/yuhonas/free-exercise-db)** by yuhonas, released under the **Unlicense** (public-domain dedication, checked in its `LICENSE.md`). No credit is required. Stored as `<dataset id>/{0,1}.jpg` (start and end position), resized to 640 px wide.
- **[wger](https://wger.de)**, used where it covers an exercise free-exercise-db doesn't, or covers it more accurately. Each image is licensed **CC BY-SA 4.0** by its uploader, per wger's API.
  - Changes made: resized to 640 px wide, transparency flattened to white, converted to JPEG.
  - The adapted files stay under CC BY-SA 4.0.
  - The app shows the credit (title, author, license and source link) under each wger image.

Match types:

- **exact**: the image shows the same movement.
- **similar**: the same movement pattern with a different implement or a missing detail. The app labels these "Similar: …".
- **placeholder**: no suitable image in either dataset. The app shows the cue text and a "Watch form" link to a YouTube search. Every exercise has that link.

Rejected wger candidates:

- **Hollow Hold**: the image is AI-generated and shows a V-up, not a hollow hold.
- **Torso Twist**: a standing twist, not a thoracic rotation drill.
- **Single-Leg Soft-Landing Holds**: a hop-and-stick, not a depth drop.
- **Single-Leg Deadlift with Dumbbell**: bench-supported, so no better than the current image.

Add your own image for any exercise from **Ski → Exercise images**. It's stored on-device in IndexedDB.

## Per exercise

| Exercise | Result | Source | Source image |
|---|---|---|---|
| Pelvic Tilt | placeholder | none | YouTube search link only |
| Dead Bug | exact | free-exercise-db | Dead Bug (`Dead_Bug`) |
| Bird Dog | exact | wger | [Bird Dog](https://wger.de/en/exercise/1572/view/) |
| Thoracic Spine Rotation | placeholder | none | YouTube search link only |
| 90/90s with Hip Lift | placeholder | none | YouTube search link only |
| Half-Kneeling Ankle Dorsiflexion | exact | wger | [ankle dorsiflexion rocks](https://wger.de/en/exercise/1804/view/) |
| World's Greatest Stretch | exact | free-exercise-db | World's Greatest Stretch (`Worlds_Greatest_Stretch`) |
| Calf Raises | similar | free-exercise-db | Standing Dumbbell Calf Raise (`Standing_Dumbbell_Calf_Raise`) |
| Standing Hip Circles | exact | free-exercise-db | Standing Hip Circles (`Standing_Hip_Circles`) |
| Lateral Lunge to Curtsy Lunge | placeholder | none | YouTube search link only |
| High Plank Shoulder Taps | exact | wger | [Plank Shoulder Taps](https://wger.de/en/exercise/1091/view/) |
| Pogo Jumps | placeholder | none | YouTube search link only |
| Broad Jump with Back-Pedal | similar | free-exercise-db | Standing Long Jump (`Standing_Long_Jump`) |
| Depth Drop | placeholder | none | YouTube search link only |
| Goblet Squat | exact | free-exercise-db | Goblet Squat (`Goblet_Squat`) |
| Kettlebell Suitcase Carry | similar | free-exercise-db | Farmer's Walk (`Farmers_Walk`) |
| Kettlebell Lateral Lunge | exact | wger | [Sliding Lateral Lunge](https://wger.de/en/exercise/1604/view/) |
| Kettlebell Single-Arm Row | exact | free-exercise-db | One-Arm Kettlebell Row (`One-Arm_Kettlebell_Row`) |
| Dumbbell Step-Up | exact | free-exercise-db | Dumbbell Step Ups (`Dumbbell_Step_Ups`) |
| Single-Arm DB Overhead Press | exact | free-exercise-db | Dumbbell One-Arm Shoulder Press (`Dumbbell_One-Arm_Shoulder_Press`) |
| Hollow Body Hold | placeholder | none | YouTube search link only |
| Half-Kneeling Landmine Press | placeholder | none | YouTube search link only |
| Pallof Press | exact | free-exercise-db | Pallof Press (`Pallof_Press`) |
| Plank with Plate Pull-Through | placeholder | none | YouTube search link only |
| Deadlift | exact | free-exercise-db | Barbell Deadlift (`Barbell_Deadlift`) |
| Single-Leg RDL | similar | free-exercise-db | Kettlebell One-Legged Deadlift (`Kettlebell_One-Legged_Deadlift`) |
| Dumbbell Biceps Curl | exact | free-exercise-db | Dumbbell Bicep Curl (`Dumbbell_Bicep_Curl`) |
| Bulgarian Split Squat | exact | free-exercise-db | Split Squat with Dumbbells (`Split_Squat_with_Dumbbells`) |
| Copenhagen Plank | placeholder | none | YouTube search link only |
| Back-Rack Reverse Lunge | similar | free-exercise-db | Dumbbell Rear Lunge (`Dumbbell_Rear_Lunge`) |
| Kettlebell Overhead Waiter's Carry | placeholder | none | YouTube search link only |
| Barbell RDL | exact | free-exercise-db | Romanian Deadlift (`Romanian_Deadlift`) |
| Dumbbell Lateral Raise | exact | free-exercise-db | Side Lateral Raise (`Side_Lateral_Raise`) |
| Poliquin Step-Down | placeholder | none | YouTube search link only |
| Calf Raises (KB Farmer's Hold) | similar | free-exercise-db | Standing Dumbbell Calf Raise (`Standing_Dumbbell_Calf_Raise`) |
| Landmine Curtsy Lunge | placeholder | none | YouTube search link only |
| Push-Ups | exact | free-exercise-db | Pushups (`Pushups`) |
| Depth Drop to Vertical Jump | similar | free-exercise-db | Linear Depth Jump (`Linear_Depth_Jump`) |
| Single-Leg Broad Jump | similar | free-exercise-db | Single-Leg Hop Progression (`Single-Leg_Hop_Progression`) |
| Box Jumps | exact | free-exercise-db | Front Box Jump (`Front_Box_Jump`) |
| Lateral Single-Leg Hops | exact | free-exercise-db | Single-Leg Lateral Hop (`Single-Leg_Lateral_Hop`) |
| Sprint Intervals | similar | free-exercise-db | Running, Treadmill (`Running_Treadmill`) |
| Broad Jump to Vertical Jump | similar | free-exercise-db | Standing Long Jump (`Standing_Long_Jump`) |
| Squat Jump | exact | free-exercise-db | Freehand Jump Squat (`Freehand_Jump_Squat`) |
| Lateral Medicine Ball Toss | placeholder | none | YouTube search link only |
| Kettlebell Swings | exact | wger | [Kettlebell Swing](https://wger.de/en/exercise/960/view/) |
| Conditioning Intervals | similar | free-exercise-db | Running, Treadmill (`Running_Treadmill`) |
| Agility Ladder | placeholder | none | YouTube search link only |
| Zone 2 Cardio | similar | free-exercise-db | Jogging, Treadmill (`Jogging_Treadmill`) |
| Calf Raises (3s lower) *(knee-friendly sub)* | similar | free-exercise-db | Standing Dumbbell Calf Raise (`Standing_Dumbbell_Calf_Raise`) |
| Tempo Goblet Squat to Box *(knee-friendly sub)* | similar | free-exercise-db | Goblet Squat (`Goblet_Squat`) |
| Step-Down from Low Step *(knee-friendly sub)* | placeholder | none | YouTube search link only |
| Bodyweight Step-Up *(knee-friendly sub)* | similar | free-exercise-db | Dumbbell Step Ups (`Dumbbell_Step_Ups`) |
| Lateral Band Walks *(knee-friendly sub)* | exact | wger | [Hip-Out and Hip-In Lateral Steps](https://wger.de/en/exercise/2618/view/) |
| Bike / Rower Intervals *(knee-friendly sub)* | similar | free-exercise-db | Bicycling, Stationary (`Bicycling_Stationary`) |

**Totals:** 23 exact · 16 similar · 16 placeholder (55 exercises; 33 from free-exercise-db, 6 from wger).

## wger image credits

| Used for | wger exercise | Author | License | File |
|---|---|---|---|---|
| Bird Dog | [Bird Dog](https://wger.de/en/exercise/1572/view/) | Settebello | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/exercise-images/wger-1572/0.jpg` |
| Half-Kneeling Ankle Dorsiflexion | [ankle dorsiflexion rocks](https://wger.de/en/exercise/1804/view/) | Davidgj32 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/exercise-images/wger-1804/0.jpg` |
| High Plank Shoulder Taps | [Plank Shoulder Taps](https://wger.de/en/exercise/1091/view/) | clafal | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/exercise-images/wger-1091/0.jpg` |
| Kettlebell Lateral Lunge | [Sliding Lateral Lunge](https://wger.de/en/exercise/1604/view/) | RiccaBaro | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/exercise-images/wger-1604/0.jpg` |
| Kettlebell Swings | [Kettlebell Swing](https://wger.de/en/exercise/960/view/) | wger contributors | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/exercise-images/wger-960/0.jpg` |
| Lateral Band Walks *(knee-friendly sub)* | [Hip-Out and Hip-In Lateral Steps](https://wger.de/en/exercise/2618/view/) | wger contributors | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | `public/exercise-images/wger-2618/0.jpg` |
