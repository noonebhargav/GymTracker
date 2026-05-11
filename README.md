# GymTracker

A simple, fast gym workout tracker for managing weekly routines and logging exercises. Built with Expo, React Native Reusables, and SQLite. Runs on iOS, Android, and Web.

## Navigation (5 Bottom Tabs)

| Tab | Purpose |
|---|---|
| **Workout** | Log daily exercises — sets, weight, reps |
| **Routine** | Configure which body parts go on each day (Mon–Sun) |
| **Explore** | Search/browse all exercises by body part or equipment |
| **History** | Calendar view of past workouts + weekly summaries |
| **Settings** | App preferences |

## Exercise Categories (8 Groups)

1. **Chest**  2. **Back**  3. **Shoulders**  4. **Biceps**  5. **Triceps**  6. **Legs**  7. **Core / Abs**  8. **Cardio**

## Core Flows

### Workout (Today)
- Auto-detects the current day's scheduled body parts from the routine.
- Horizontal tabs: `[All] [Chest] [Shoulders] [Triceps]` (dynamically filtered to today's parts).
- Tap an exercise → enter weight + reps → save the set.
- **Queue mode** (optional): missed body parts carry forward one day.

### Routine
- Monday through Sunday layout.
- Select any number of body parts per day.

### Explore
- Search bar at top.
- Two collapsible sections: **Body Parts** and **Equipment**.
- Grid of categories — tap one to see exercises in that category.
- Search filters across both sections simultaneously.

### History
- Calendar view. Tap a date to see that day's logged exercises.
- Side-by-side **Weekly Summary**: body parts worked, total exercises, average weight/reps.

### Settings
| Setting | Default | Description |
|---|---|---|
| Queue mode | Off | On: missed body parts carry forward to the next day (max 1 day). Off: missed parts are skipped. |
| Theme | System | System / Light / Dark |
| Disable GIFs | Off | Hides animated exercise GIFs (static images remain) |

## Queue Mode Behaviour

When enabled, if you don't log any sets for a scheduled body part:
- That body part is queued to the **next calendar day** (even if it has no routine).
- If that next day is also missed, the queued part is **lost** — it does not cascade further.
- Queued parts are tracked **per body part**, not per day — partially completed days only queue the missed parts.
- Duplicate body parts on the same day are merged (shown once).

## Tech Stack

- Compiled with [Expo Router](https://expo.dev/router) (file-based routing)
- Styled with [Tailwind CSS v4](https://tailwindcss.com/) via [Uniwind](https://uniwind.dev/)
- UI components from [React Native Reusables](https://github.com/founded-labs/react-native-reusables) (shadcn/ui for React Native)
- Database: `expo-sqlite`
- Icons: `lucide-react-native`
- Animation: `react-native-reanimated` v4

## Getting Started

```bash
npm install
npm run dev
```

- iOS: press `i` (Mac only)
- Android: press `a`
- Web: press `w`

Or scan the QR code with [Expo Go](https://expo.dev/go).

## Adding UI Components

```bash
npx react-native-reusables/cli@latest add [...components]
```
