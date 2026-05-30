# Hypertrophy Tracker

A clean, phone-friendly **weightlifting hypertrophy tracker** built as an
installable PWA. Training logic is based on Renaissance Periodization (Dr. Mike
Israetel) volume landmarks, double-progression, RIR autoregulation, and
Nippard-style exercise tiers.

- **Stack:** Next.js (App Router, TypeScript) + Tailwind CSS
- **Storage:** on-device `localStorage` (no backend, no login). The data layer
  is built behind a `StorageAdapter` interface so cloud sync (e.g. Supabase) can
  be added later without rewriting screens.
- **PWA:** installable to your iPhone home screen, works offline.

## Build phases

- **Phase 1 (done):** Scaffold, mobile layout + bottom nav, Mon/Wed/Fri
  Push-Pull-Legs split with a starter exercise list, PWA (manifest + icons +
  service worker), clean Today screen, exercise library, and a progression
  preview. Set logging is stubbed.
- **Phase 2 (done):** Set logging (weight / reps / RIR) saved to localStorage,
  with edit/delete and a bottom-sheet logger.
- **Phase 3 (done):** Double-progression "add weight" nudges, RP weekly volume
  coaching, and per-exercise weight/volume history charts.
- **Phase 4 (done):** Tier-ranked swap suggestions — swap any exercise in your
  plan for a same-muscle alternative (S→A→B) and adjust set counts, with an
  "In plan" marker in the library.
- **Phase 5 (optional):** cloud sync + login.

## Run locally

```bash
npm install
npm run dev      # open http://localhost:3000
```

## Project map

```
app/                 screens (Today, Progression, History, Library)
components/          UI building blocks + DataProvider + nav + SW registrar
lib/                 training logic & data
  types.ts           shared data shapes
  exercises.ts       the exercise library (with tiers)
  split.ts           the Mon/Wed/Fri Push-Pull-Legs split
  muscles.ts         muscle labels + RP volume landmarks (MEV/MAV/MRV)
  volume.ts          weekly set-count + status helpers
  storage/           StorageAdapter interface + localStorage implementation
public/              manifest, service worker (sw.js), app icons
scripts/             icon generator
```

## Deploy to Vercel

See the step-by-step instructions your assistant provided, or the short version:

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New… → Project** → import the
   repo.
3. Framework preset auto-detects **Next.js**. Leave defaults. Click **Deploy**.
4. Open the live URL on your iPhone in Safari → **Share → Add to Home Screen**.
