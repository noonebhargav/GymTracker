# Task 3 — Rest timer + session stopwatch (background-capable)

**Status:** todo
**New deps:** `expo-notifications` · **Risk:** medium-high · Requires dev-client rebuild + `app.json` plugin.

## Why
Add a **rest countdown between sets** and a **session stopwatch**, both background-capable (notification fires when rest ends even if the phone is locked). Web degrades to foreground-only.

## Scope
**3a. Settings** — `lib/database.ts` + `app/(tabs)/settings.tsx`: new keys `rest_timer_enabled` (bool) and `default_rest_seconds` (default 90). Add a Switch row + a Stepper/RulerWheel row (reuse `StepperRow` / `RulerWheel`). **Add both keys to `resetAllData` defaults** (`database.ts:243-274`).

**3b. Rest timer** — new `components/ui/rest-timer.tsx`, modeled on the `components/ui/ruler-wheel.tsx` bottom-sheet modal (animated backdrop + handle). Countdown via `setInterval` in `useEffect` with cleanup. On expiry: `Haptics.notificationAsync(Success)`. Controls: +15s / skip / dismiss.
- Trigger from the set editor's `markAsDone` success path (`app/(tabs)/workout/[tab]/[id].tsx:245-247`) when `rest_timer_enabled`.
- **Background:** on start, schedule a local notification at `now + seconds`; cancel on skip/dismiss or in-foreground completion. Request notification permission lazily on first use; deny path must not crash (still works in-foreground).

**3c. Session stopwatch** — count-up for the whole workout. Store a `session_started_at` timestamp (component state or a lightweight store like `lib/accent-store.ts`); render `mm:ss` in the workout header (`components/workout-screen.tsx`). Start on first set logged / first screen entry; tap-to-reset. **Derive from the start timestamp**, not an accumulated tick counter, so it survives backgrounding.

## Files
- new `components/ui/rest-timer.tsx`
- `app/(tabs)/workout/[tab]/[id].tsx`
- `components/workout-screen.tsx`
- `app/(tabs)/settings.tsx`
- `lib/database.ts`
- `package.json`, `app.json` (notifications plugin)

## Verify
- `npx tsc --noEmit`
- Enable rest timer, mark a set done → countdown shows; lock phone → notification fires at zero; +15s / skip work.
- Stopwatch counts up and stays correct after backgrounding.
- Web degrades to foreground-only without crashing.
