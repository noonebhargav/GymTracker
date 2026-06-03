# Task 1 — Pill restyle + Routine layout rework

**Status:** todo
**New deps:** none · **Risk:** low · **Do first.**

## Why
The Routine tab feels top-heavy and its tap targets are small (36px, below the 44px guideline). Workout filter pills share the same component, so we fix both at once.

## Scope
**1a. Enlarge the shared pill** — `components/ui/tabs.tsx:54`. Bump the `pill` shape from `h-9 px-4` to ~`h-11 px-5` (≈44px). Keep `rounded-full`. This auto-enlarges both Routine day pills (`app/(tabs)/routine.tsx:114-135`) and Workout filter pills (`components/workout-screen.tsx`).

**1b. Rework Routine body-part picker** — `app/(tabs)/routine.tsx:146-187`. Replace the `flex-row flex-wrap` of `w-1/2 p-2` half-width chips (inner `h-9` pill) with **larger 2-col grid cards** (e.g. `h-14`/`h-16`, `rounded-2xl`) showing the group name with the existing 3-state styling:
- selected → `bg-primary` + `text-primary-foreground`
- covered → `bg-primary/15` + `text-primary` + Check icon (optionally show assigned-day hint from `partToDays`)
- unassigned → `bg-secondary` + `text-muted-foreground`

Keep `toggleBodyPart`, `getChipState`, and accessibility props (`accessibilityRole="switch"`, `accessibilityState`).

**1c.** Verify Workout filter pills still align after the height change, including the carryover dot (`absolute top-1 right-1` in `components/workout-screen.tsx`).

## Files
- `components/ui/tabs.tsx`
- `app/(tabs)/routine.tsx`
- sanity-check `components/workout-screen.tsx`

## Verify
- `npx tsc --noEmit`
- Run app: bigger pills on Routine + Workout; Routine cards toggle and persist across day switches and app restart; a11y roles intact.
