# GymTracker

A simple, fast gym workout tracker for managing weekly routines and logging exercises. Built with Expo, React Native Reusables, and SQLite. Runs on iOS, Android, and Web.

## Navigation (5 Bottom Tabs)

| Tab | Purpose |
|---|---|
| **Workout** | Log daily exercises — sets, weight, reps |
| **Routine** | Configure which body parts go on each day (Mon–Sun) |
| **Explore** | Search/browse all exercises by body part or equipment |
| **History** | Calendar view, weekly summaries, and insights |
| **Settings** | App preferences and defaults |

## Exercise Categories (8 Groups)

1. **Chest**  2. **Back**  3. **Shoulders**  4. **Biceps**  5. **Triceps**  6. **Legs**  7. **Core / Abs**  8. **Cardio**

## Core Flows

### Workout (Today)
- Auto-detects the current day's scheduled body parts from the routine.
- Horizontal tabs: `[All] [Chest] [Shoulders] [Triceps]` (dynamically filtered to today's parts).
- Tap an exercise → full-screen set editor with RulerWheel for weight/reps and ± steppers.
- Mark set as done or remove it; sets auto-renumber.
- **Queue mode** (optional): missed body parts carry forward one day.

### Routine
- Monday through Sunday layout.
- Select any number of body parts per day.
- Body parts already assigned to another day are shown with a tint + checkmark.

### Explore
- Search bar filters across all exercises in real time.
- Two collapsible sections: **Body Parts** and **Equipment** (12 consolidated categories).
- Tap a category → grid of exercises with images.
- Tap an exercise → full detail with GIF animation and step-by-step instructions.

### History
Three tabs inside the History screen:

- **Calendar** — monthly calendar; tap any date to see that day's logged exercises with sets, weight, and reps.
- **Summary** — weekly overview: body parts worked, total sets, average weight per body part.
- **Insights** — 10-week bar chart (accent bars = weeks with data), body-part heatmap for the last 7 days, and personal records for the current window. Window navigator is bounded by first logged date.

### Settings

| Setting | Default | Description |
|---|---|---|
| Units | Lbs | Weight display unit (Lbs / Kg) |
| Mode | Skip | Queue: missed body parts carry forward. Skip: missed parts are dropped. |
| Sets | 3 | Default set count for new exercises |
| Weight | 20 lbs | Default starting weight (RulerWheel picker) |
| Reps | 10 | Default rep count (RulerWheel picker) |
| Theme | System | Light / System / Dark |
| Accent | Lime | App accent colour (10 swatches) |
| Reset | — | Wipes all workout history, routines, and settings |

## Queue Mode Behaviour

When enabled, if you don't log any sets for a scheduled body part:
- That body part is queued to the **next calendar day** (even if it has no routine).
- If that next day is also missed, the queued part is **lost** — it does not cascade further.
- Queued parts are tracked **per body part** — partially completed days only queue the missed parts.
- Duplicate body parts on the same day are merged (shown once).

## Tech Stack

- [Expo SDK 55](https://expo.dev/) with [Expo Router v4](https://expo.dev/router) (file-based routing)
- [Tailwind CSS v4](https://tailwindcss.com/) via [Uniwind](https://uniwind.dev/)
- [React Native Reusables](https://github.com/founded-labs/react-native-reusables) (shadcn/ui for React Native)
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
