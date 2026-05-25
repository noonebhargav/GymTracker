# Project Review — Findings & Tasks

**Date:** 2026-05-25
**Scope:** UI/UX consistency, bugs, app flow/logic improvements across the whole app.

---

## Progress (19/30 done)

**Done** — all bugs (1.1–1.12), UI items 2.1–2.5, RulerWheel items 3.9 & 3.10.
**Remaining** — UI items 2.6–2.8 (PR persistence, sticky Done button, haptics) and all of Section 3 except RulerWheel (3.1–3.8).

---

## Legend

- **Severity:** High / Medium / Low
- **Effort:** S (≤30 min) / M (~1–3 h) / L (multi-session)
- **Status:** `[ ]` open, `[x]` done

---

## 1. Bugs (correctness)

### 1.1 Broken URL routing for "Core/Abs"

- **Severity:** High &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

`GOLD_STANDARD_GROUPS` contains the literal string `'Core/Abs'`. Explore lowercases group names and drops them straight into URLs, so the `/` becomes a path separator and the destination route no longer matches.

**Affected files**

- [app/(tabs)/explore/index.tsx:172](../app/(tabs)/explore/index.tsx#L172) — body-part cards → `/explore/core/abs`
- [app/(tabs)/explore/index.tsx:94](../app/(tabs)/explore/index.tsx#L94) — search → detail → `/explore/core/abs/<id>`

**Fix**

- Slugify Gold Standard groups in URLs (e.g. `core-abs`) and decode in `resolveFilter` in [app/(tabs)/explore/[filter]/index.tsx](<../app/(tabs)/explore/[filter]/index.tsx>).
- Mirror the workout screen's `encodeURIComponent(selectedTab)` pattern at [components/workout-screen.tsx:242](../components/workout-screen.tsx#L242) as a fallback.

---

### 1.2 `today` captured once at mount

- **Severity:** High &nbsp;·&nbsp; **Effort:** M
- **Status:** `[x]`

Every screen computes `todayDateStr()` in component scope. If the app stays open past midnight, sets are logged against yesterday's date, "Today's session" is wrong, and the streak indicator stops updating.

**Affected files**

- [components/workout-screen.tsx:91](../components/workout-screen.tsx#L91)
- [app/(tabs)/workout/[tab]/[id].tsx:69](<../app/(tabs)/workout/[tab]/[id].tsx#L69>)
- [app/(tabs)/history/index.tsx:63](../app/(tabs)/history/index.tsx#L63)

**Fix**

- Recompute on `useFocusEffect`, or subscribe to `AppState` `active` and re-derive `today` if the date changed.
- Extract a `useToday()` hook so all screens stay in sync.

---

### 1.3 Insights tab ignores accent color

- **Severity:** High &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

The chart and heatmap hard-code lime. Changing accent in Settings has no effect on this screen.

**Affected file**

- [components/history/insights-tab.tsx:20](../components/history/insights-tab.tsx#L20) — `const PRIMARY_COLOR = '#d8fe3d';`
- Same file lines 150, 156, 214, 239 — `rgba(216,254,61,...)`

**Fix**

- Read the accent via `useAccentHex()` and derive `rgba()` values at runtime (parse hex → rgb).

---

### 1.4 Accent fallback flicker on cold launch

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

Components fall back to lime until `AccentLoader` resolves the stored accent.

**Affected files**

- [components/ui/ruler-wheel.tsx:54](../components/ui/ruler-wheel.tsx#L54)
- [app/(tabs)/workout/[tab]/[id].tsx:67](<../app/(tabs)/workout/[tab]/[id].tsx#L67>)

**Fix**

- Block first paint until accent is loaded, or persist accent synchronously (e.g. write to a module-level cache the very first time it's read and consume that on next launch via the splash screen).

---

### 1.5 Accent state inconsistent after Reset

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

[app/(tabs)/settings.tsx:278](../app/(tabs)/settings.tsx#L278) calls `setAccent(undefined)` while restoring `accentColor='lime'`. Visually OK (consumers fall back), but `_hex` is inconsistent.

**Fix**

- Pass the lime swatch hex: `setAccent('#d8fe3d')` (or look it up from `ACCENT_COLORS`).

---

### 1.6 `replaceWorkoutSets` deletes-then-inserts unconditionally

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** M
- **Status:** `[x]`

[lib/database.ts:348](../lib/database.ts#L348) wipes all rows for `(date, exercise)` even when the user only opened the editor. `created_at` is regenerated and ids change.

**Fix**

- Diff against the existing rows; only insert/delete the deltas.
- Or `UPSERT` keyed on `(date, exercise, set_number)`.

---

### 1.7 Streak ignores routine cadence

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** M
- **Status:** `[x]`

[lib/database.ts:501](../lib/database.ts#L501) counts only consecutive calendar days. If the routine is Mon/Wed/Fri, the streak resets every off-day.

**Fix**

- Routine-aware streak: only count rest days defined by the routine as breaking the streak.
- Or surface "workouts this week" instead of raw day-count.

---

### 1.8 `pl-13` is not a Tailwind class

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

[app/(tabs)/history/[date].tsx:187](<../app/(tabs)/history/[date].tsx#L187>) — no padding applied; set rows don't align with the rest of the card.

**Fix**

- Use `pl-12` or `ml-[64px]` to match the image+gap width.

---

### 1.9 Day Summary card has no background

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

[app/(tabs)/history/[date].tsx:125](<../app/(tabs)/history/[date].tsx#L125>) sets `border border-primary/10` but no fill — invisible against the page in light mode.

**Fix**

- Add `bg-card` (matches the rest of the app's card styling).

---

### 1.10 Dead code

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

- [components/exercise-detail.tsx](../components/exercise-detail.tsx) — `ExerciseDetailModal` never imported (replaced by [app/exercise-detail/[id].tsx](<../app/exercise-detail/[id].tsx>)).
- [components/workout-screen.tsx:320](../components/workout-screen.tsx#L320) — `text-muted-foreground` on a `<View>` has no effect.

**Fix**

- Delete `components/exercise-detail.tsx`.
- Drop the orphaned `text-muted-foreground` from the className.

---

### 1.11 Hardcoded white GIF cards look wrong in dark mode

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

- [app/(tabs)/explore/[filter]/[id].tsx:49](<../app/(tabs)/explore/[filter]/[id].tsx#L49>)
- [app/exercise-detail/[id].tsx:59](<../app/exercise-detail/[id].tsx#L59>)

Both screens hard-code `backgroundColor: '#fff'` behind the exercise GIF.

**Fix**

- Use `bg-card`, or a subtle off-white tint that respects theme.

---

### 1.12 iOS modal uses fixed status-bar padding

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

[app/exercise-detail/[id].tsx:46](<../app/exercise-detail/[id].tsx#L46>) hard-codes `paddingTop: 16` on iOS — wrong for notch / Dynamic Island.

**Fix**

- Use `useSafeAreaInsets().top`.

---

## 2. UI / UX inconsistencies

### 2.1 Two different segmented controls

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

History tab rolls its own pill switcher inline at [app/(tabs)/history/index.tsx:172](../app/(tabs)/history/index.tsx#L172), while Settings uses [components/ui/segmented-control.tsx](../components/ui/segmented-control.tsx).

**Fix**

- Migrate History to the primitive, or generalise the History style and use it everywhere.

---

### 2.2 "Skip" vs "Queue" mode is unexplained

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

[app/(tabs)/settings.tsx:339](../app/(tabs)/settings.tsx#L339) — toggle labelled "Mode" with two cryptic options.

**Fix**

- Add a description line (e.g. "Queue: missed workouts roll over to today").

---

### 2.3 Touch targets below 44pt

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

- Search-bar clear button (`p-3` ≈ 36pt) in workout/explore.
- AccentRow swatches (`size-10` = 40pt) in Settings.

**Fix**

- Bump to `size-11` / `p-3.5`, or wrap in a 44pt Pressable.

---

### 2.4 Empty-state CTAs missing

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

- Workout tab when no routine is set: shows "No recent exercises" with no link to Routine.
- History tab when no workouts: hints "Head over to the Workout tab" but renders no button ([app/(tabs)/history/index.tsx:155](../app/(tabs)/history/index.tsx#L155)).

**Fix**

- Add a "Set up your routine" `Pressable` that `router.push('/routine')` in the workout empty state.
- Add a button to navigate to Workout in the History empty state.

---

### 2.5 Calendar dot inflates row height

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

[components/history/calendar-tab.tsx:165](../components/history/calendar-tab.tsx#L165) — weeks with workouts are taller than empty weeks.

**Fix**

- Reserve the dot area always (fixed cell height), or render the dot as an absolutely-positioned overlay.

---

### 2.6 PR badge disappears on re-entry

- **Severity:** Low &nbsp;·&nbsp; **Effort:** M
- **Status:** `[ ]`

[app/(tabs)/workout/[tab]/[id].tsx:226](<../app/(tabs)/workout/[tab]/[id].tsx#L226>) — `prWeight` is local state; lost on navigation.

**Fix**

- Persist PR events (or derive from logs) and surface them in History / Insights, not just as a transient header chip.

---

### 2.7 Bottom action button falls below the fold

- **Severity:** Low &nbsp;·&nbsp; **Effort:** M
- **Status:** `[ ]`

`Mark as Done` lives inside the ScrollView. On smaller phones with 4+ sets it scrolls off-screen.

**Fix**

- Pin the action to the bottom with a safe-area-aware sticky bar.

---

### 2.8 Haptics applied inconsistently

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[ ]`

Settings toggles and routine chips trigger haptics; tab navigation and Done badge taps don't.

**Fix**

- Pick a rule (e.g. selection feedback on any state change) and apply uniformly.

---

## 3. App flow & logic

### 3.1 Replace `workout/index.tsx` redirect with `initialRouteName`

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[ ]`

[app/(tabs)/workout/index.tsx:5](<../app/(tabs)/workout/index.tsx#L5>) redirects to `/workout/recent`, causing a transient flash on cold start.

**Fix**

- Set `initialRouteName="recent"` (or equivalent) in [app/(tabs)/workout/_layout.tsx](<../app/(tabs)/workout/_layout.tsx>) and delete `index.tsx`.

---

### 3.2 `useFocusEffect` refetches 4 queries on every focus

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** M
- **Status:** `[ ]`

[components/workout-screen.tsx:118](../components/workout-screen.tsx#L118) — most data doesn't change between navigations.

**Fix**

- Cache per-day; invalidate only when returning from the set editor with a "marked done" payload.
- Lightweight option: pass a `routerEvent` boolean from set editor back to workout via search params.

---

### 3.3 `getRecentExercises` always loaded

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[ ]`

[components/workout-screen.tsx:161](../components/workout-screen.tsx#L161) — fetched even when the user is on a body-part tab.

**Fix**

- Lazy-load on first selection of the `recent` tab.

---

### 3.4 Whole exercise catalog held in JS memory

- **Severity:** Low &nbsp;·&nbsp; **Effort:** M
- **Status:** `[ ]`

WorkoutScreen and ExploreIndex hold all 1,324 rows to compute counts.

**Fix**

- Compute group/equipment counts in SQL (`SELECT body_part, COUNT(*) FROM exercises GROUP BY body_part`) and only load full rows when needed for a tab.

---

### 3.5 Search filter recomputes on every keystroke

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[ ]`

[components/workout-screen.tsx:210](../components/workout-screen.tsx#L210) — fine at this size, but typing causes full list rerender.

**Fix**

- Debounce `searchText` (~150 ms) before filtering.

---

### 3.6 Reset dialog blocks while deleting

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[ ]`

[app/(tabs)/settings.tsx:259](../app/(tabs)/settings.tsx#L259) deletes thousands of rows synchronously inside the dialog.

**Fix**

- Show the count being deleted up front; dismiss dialog and run delete in background.

---

### 3.7 `isDirty` uses `JSON.stringify`

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[ ]`

[app/(tabs)/workout/[tab]/[id].tsx:74](<../app/(tabs)/workout/[tab]/[id].tsx#L74>) allocates strings every render.

**Fix**

- Shallow numeric comparator (length check, then per-index `weight`/`reps`).

---

### 3.8 Routine "Queue mode" is invisible

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[ ]`

When yesterday's unfinished parts get merged into today ([components/workout-screen.tsx:140](../components/workout-screen.tsx#L140)), the user has no way to tell which body parts are carryovers vs scheduled.

**Fix**

- Add a "Carryover" badge or a divider in the tab bar.

---

### 3.9 RulerWheel updates parent per scroll frame

- **Severity:** Medium &nbsp;·&nbsp; **Effort:** M
- **Status:** `[x]`

[components/ui/ruler-wheel.tsx:71](../components/ui/ruler-wheel.tsx#L71) — at `scrollEventThrottle={16}` that's ~60 setState calls/s, each rerendering the calling editor.

**Fix**

- Throttle the parent `onChange` (commit on `onMomentumScrollEnd` / `onScrollEndDrag`).
- Keep an internal `useRef` for the live value used by the in-sheet number display.

---

### 3.10 RulerWheel snap is abrupt

- **Severity:** Low &nbsp;·&nbsp; **Effort:** S
- **Status:** `[x]`

`onScrollEnd` snaps with `animated: false`.

**Fix**

- Use `animated: true` for the snap-back; consider a tiny overshoot.

---

## Suggested order of attack

| Order | Item | Why first |
|---|---|---|
| 1 | 1.1 Core/Abs URL bug | Easy win; currently breaks a whole category |
| 2 | 1.2 `today` staleness | Data correctness; trivial to hit in normal use |
| 3 | 1.3 Insights accent | Affects every non-lime user immediately |
| 4 | 1.9 Day Summary background + 1.8 `pl-13` | Quick visual cleanups |
| 5 | 2.4 Empty-state CTAs | Big onboarding win |
| 6 | 3.9 RulerWheel throttling | Perceived performance, especially on Android |
| 7 | 1.6 Replace-workout-sets diff | Data hygiene for later analytics |
| 8 | Everything else | Polish |
