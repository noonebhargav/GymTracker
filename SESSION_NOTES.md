# Session Notes — GymTracker (Session 2)

## Completed Phases

| Phase | Task | Status |
|---|---|---|
| 01 | Navigation Shell | done (from before) |
| 02 | Database | done |
| 03 | Explore Tab | done |
| 04 | Routine Tab | done |
| 05 | Workout Tab | done |
| 06 | History Tab | pending |
| 07 | Settings Tab | pending |

---

## Critical Gotchas & Decisions

### 13. Unicode Escapes in JSX
- `\u2026`, `\u201C`, `\u201D` do NOT work as bare text children in JSX — they render as literal text
- **Inside string props**: use the actual unicode character (e.g., `placeholder="Search…"`)
- **Inside JSX expressions**: wrap in JS string `{'\u201C'}` so the escape resolves in JavaScript

### 14. Chip Border Consistency
- Selected and unselected chips must keep the same border width to prevent layout shift
- Unselected: `border border-border` — selected: `border border-primary` (not just no border)
- Changing border adds/removes 2px of height, causing `flex-wrap` reflow

### 15. Reanimated Animation Pattern
- `Animated.View` with `key` prop forces remount on key change → plays exiting animation for old + entering for new
- `entering={FadeInDown.duration(250)}` / `exiting={FadeOutUp.duration(200)}` for expand/collapse
- Without `key`, changing content causes instant swap (no exit animation)

### 16. Routines Data Model
- `routines` table: `day_of_week INTEGER` (0=Mon … 6=Sun), `body_part TEXT`, `UNIQUE(day_of_week, body_part)`
- Day-to-parts: `Map<number, Set<string>>` in local state
- Part-to-days: derived via `useMemo` for already-covered indicator
- Optimistic update: `setState(updated)` → DB write → revert on failure

### 17. Already-Covered Indicator (Option B)
- When a body part is assigned to a different day, show translucent primary tint + `Check` icon
- Three chip states determined by `getChipState()`:
  - `selected`: `bg-primary border border-primary text-primary-foreground`
  - `covered`: `bg-primary/15 border border-primary/25` + `Check` icon + `text-primary`
  - `unassigned`: `bg-muted/50 border border-border text-muted-foreground`

### 18. Equipment Consolidation
- Original 28 raw equipment types → 12 display categories (11 named + "Other")
- 17 small types merged into "Other": assisted, bosu ball, elliptical machine, hammer, medicine ball, olympic barbell, resistance band, roller, rope, skierg machine, sled machine, stationary bike, stepmill machine, tire, trap bar, upper body ergometer, wheel roller
- `toConsolidatedEquipment(raw)` maps raw → consolidated; `isOtherEquipment(raw)` check
- `getExercisesByEquipmentList(db, list)` for batched `IN (...)` queries (used for "Other")
- When navigating to "Other" filter: exercises use raw equipment label, NOT "Other"

### 19. Explore A11y Fixes Applied
- Search input: `aria-label`, `spellCheck={false}`, `autoComplete="off"`
- Icon buttons: clear/back all have `aria-label`, icons marked `aria-hidden`
- CollapsibleSection: `accessibilityRole="button"`, `aria-expanded`
- Exercise images: `accessibilityLabel`
- Empty states for empty search + empty filter
- Loading: `ActivityIndicator` while fetching

### 20. Web VFS Diagnostic
- Added COEP/COOP meta HTTP-equiv tags in `app/+html.tsx` as static export fallback
- Added diagnostic `<script>` that warns if `SharedArrayBuffer` is unavailable
- `metro.config.js` already had correct headers via `enhanceMiddleware`

### 21. Android Modal White Flash
- `presentation: 'modal'` on Android has a known white flash during animation
- Root cause: Android system UI default white background bleeds through
- Fix: `import * as SystemUI from 'expo-system-ui'` + `SystemUI.setBackgroundColorAsync('transparent')` in root `_layout.tsx`
- Ref: https://github.com/expo/expo/issues/27099

### 22. ScrollView Height Stretching on RN Web
- Horizontal `ScrollView` children with `items-center shrink-0` stretch to 260+ px on web
- Root cause: RN Web's ScrollView content container fills available flex space, and `shrink-0` prevents width-shrinking but height still stretches
- Fix: Remove wrapping `<View className="items-center shrink-0">`, render `Pressable` pills directly inside ScrollView

### 23. Reanimated CollapsibleContent Rendering Issue
- Starting `height` shared value at `0` prevents `onLayout` from firing on child content
- Fix: Use `layoutReady` shared value flag — render `height: undefined` (auto) until `onLayout` fires, then switch to animated `height` value
- Better approach (final): moved to subroute — no animation needed

### 24. Expo Router Cross-Tab Navigation
- `router.push('/explore/chest/123')` from workout tab switches tabs and pushes onto explore Stack
- Tapping active tab icon does NOT reset to root by default (custom TabBar guards with `!isFocused`)
- Solution for exercise detail: use root-level modal `/exercise-detail/{id}` instead of cross-tab navigation — back gesture naturally returns to source

### 25. Workout Subroute Architecture
- `app/(tabs)/workout/[tab]/[id].tsx` — full-screen set editor, pushed onto workout Stack
- Exercise info card navigates to `app/exercise-detail/[id].tsx` (root Stack modal, `presentation: 'modal'`)
- `app/(tabs)/workout/[tab].tsx` — file, not directory — must NOT create `[tab]/` directory with `index.tsx` (would conflict)
- Stack screens: `index`, `[tab]`, `[tab]/[id]` all declared in `_layout.tsx`
- `[tab]/[id]` uses `animation: 'slide_from_right'` for proper push/pop feel

### 26. Set Editor Design Decisions
- Fast steppers: weight ±10/20 (kg/lbs), reps ±5
- Slow steppers: weight ±2.5/5, reps ±1
- Icons: `ChevronsLeft`, `ChevronLeft`, `ChevronRight`, `ChevronsRight` (no text `<<`/`>>`)
- Remove set: `MinusCircle` icon on Set header row (right-aligned), hidden when only 1 set
- Set numbering: `Set {idx + 1}` auto-renumbers correctly via `filter`
- Mark as Done / Remove: ternary — never both visible
- `isDirty` check: `JSON.stringify(setValues) !== JSON.stringify(initialSetValues)` — fine here (single screen, not FlatList)

### 27. Routine Refresh on Tab Switch
- `useFocusEffect` in `workout-screen.tsx` must reload `getAllRoutines(db)` to pick up routine changes
- `Promise.all` already loads `queue_enabled` and `completedToday` — adding routines is one more promise
- Rebuild `Map<number, Set<string>>` from fresh rows each time

---

## Key Files Created/Modified This Session

| File | Purpose |
|---|---|
| `app/(tabs)/routine.tsx` | Full routine tab: day selector + expand + chip grid |
| `lib/database.ts` | Added `RoutineRow`, `getAllRoutines()`, `setRoutineDay()`, `getExercisesByEquipmentList()` |
| `lib/exercise-groups.ts` | Added `PRIMARY_EQUIPMENT`, `OTHER_EQUIPMENT_TYPES`, `DISPLAY_EQUIPMENT`, consolidation helpers |
| `app/(tabs)/explore/index.tsx` | Equipment consolidation + a11y fixes + empty states + unicode fixes |
| `app/(tabs)/explore/[filter]/index.tsx` | "Other" handling + `getExercisesByEquipmentList` + a11y fixes |
| `app/+html.tsx` | COEP/COOP meta tags + SharedArrayBuffer diagnostic script |

## Session 3 — Key Files

| File | Purpose |
|---|---|
| `components/workout-screen.tsx` | Simplified: tabs, search, exercise list. Inline editing removed — navigates to set editor subroute |
| `app/(tabs)/workout/_layout.tsx` | Added `[tab]/[id]` screen with `slide_from_right` animation |
| `app/(tabs)/workout/[tab]/[id].tsx` | Full-screen set editor: chevron steppers, remove set, Mark as Done/Remove |
| `app/exercise-detail/[id].tsx` | Modal exercise detail (GIF + instructions), root Stack |
| `app/_layout.tsx` | Registered modal screen + `SystemUI.setBackgroundColorAsync('transparent')` fix |
| `components/navigation/tab-bar.tsx` | No change (reverted) — `!isFocused` guard preserved |
| `lib/database.ts` | Added 3 indexes on `workout_logs` table |
