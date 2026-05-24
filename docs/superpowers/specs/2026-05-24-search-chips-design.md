# Search Bar & Chip Components — Design Spec

**Date:** 2026-05-24
**Phase:** 9
**Status:** Approved

## Goal

Update search bar and chip/pill components to match the Phase 8 design palette: pill-shaped search bar and consistently-sized chips across all screens.

## Files Changed

| File | Change |
|---|---|
| `components/workout-screen.tsx` | Search bar: pill + 46px + border; chips: h-9, px-4, bg-secondary inactive |
| `app/(tabs)/explore/index.tsx` | Search bar: pill + 46px + border |
| `app/(tabs)/routine.tsx` | Body part chips: h-9, px-4, bg-secondary unassigned |

## 1. Search Bar

**Both** `workout-screen.tsx` (line ~298) and `explore/index.tsx` (line ~220):

```
Before: bg-muted rounded-lg px-3 h-10
After:  bg-secondary rounded-full px-3 h-[46px] border border-border
```

Keep the clear (X) button in workout-screen — it's useful and the spec marks removal as optional.

## 2. Filter Chips — workout-screen.tsx

```
Before: h-10 px-3 ... bg-muted border border-border (inactive)
After:  h-9  px-4 ... bg-secondary text-muted-foreground (inactive)
```

Active state (`bg-primary text-primary-foreground`) is unchanged — already resolves to electric lime with dark ink.

## 3. Body Part Chips — routine.tsx

Replace `px-3 py-2.5` padding-based sizing with height-based `h-9 px-4`:

| State | Before | After |
|---|---|---|
| selected | `bg-primary border border-primary` | unchanged |
| covered | `bg-primary/15 border border-primary/25` | unchanged |
| unassigned | `bg-muted/50 border border-border` | `bg-secondary border border-border text-muted-foreground` |

## Acceptance Criteria

- [ ] Search bar is `rounded-full`, 46px tall, with `border border-border`, in both workout and explore screens
- [ ] Filter chips are `h-9` (36px), `px-4`, `bg-secondary` when inactive
- [ ] Active chips show electric lime (`bg-primary`) with dark text (`text-primary-foreground`)
- [ ] Routine body part chips are `h-9 px-4`; unassigned state uses `bg-secondary`
- [ ] Selected and covered routine chip states are unchanged
