# Phase 9: Search Bar & Chip Components

**Status:** pending

## Goal

Update shared UI components to match the design prototype's styling: pill-shaped search bar and accent-filled active chips.

## Dependencies

- Phase 8 (Visual Design System) — needs new color tokens

## 1. Search Bar

### Current
- `rounded-lg` (10px), `bg-muted`, 40px height (`h-10`)
- Search icon left, text input, optional X clear button

### Design
- `rounded-full` (pill), `bg-surface-2` (which is `bg-secondary` — `#1d2026`), 46px height
- Border: `border border-border`
- Search icon left, input, no clear button shown

### Changes

In **every screen** that has a search bar (currently `workout-screen.tsx`, `explore/index.tsx`):
- Change container: `rounded-lg` → `rounded-full`, `h-10` → `h-[46px]`
- Add `border border-border` to container
- Optional: remove X clear button to match design (or keep for usability)

## 2. Chip / Filter Pill

### Current
```
rounded-full px-3 h-10 bg-muted border-border (inactive)
rounded-full px-3 h-10 bg-primary border-primary text-primary-foreground (active)
```

### Design
```
rounded-full px-4 h-[36px] bg-secondary text-muted-foreground (inactive)
rounded-full px-4 h-[36px] bg-primary text-primary-foreground font-semibold (active)
```

With the new palette (`bg-primary` = `#d8fe3d`), active chips will be electric lime with dark text.

### Changes

In **workout-screen.tsx** (filter tab chips) and **routine.tsx** (body part chips):

- Update chip height: `h-10` → `h-9` (36px) to match design
- Active state already uses `bg-primary text-primary-foreground` — works with new tokens
- Inactive: `bg-secondary` instead of `bg-muted` (they're the same color now), `text-muted-foreground`
- Add `font-medium` on active and `font-semibold` on active for bold feel instead of extra class, just let the existing primary-foreground handle it
- Keep existing padding/layout

### Routine body part chips

The routine tab has 3 chip states (selected, covered-elsewhere, unassigned):
- `selected`: stays `bg-primary text-primary-foreground` → electric lime ✅
- `covered` (assigned to another day): stays `bg-primary/15 border-primary/25 text-primary` → subtle lime ✅
- `unassigned`: use `bg-secondary border-border text-muted-foreground`

## 3. Buttons

Not part of this phase — will be handled with set editor / CTA changes.

## Files Changed

| File | Change |
|---|---|
| `components/workout-screen.tsx` | Search bar rounded-full + height; chip size |
| `app/(tabs)/explore/index.tsx` | Search bar rounded-full + height |
| `app/(tabs)/routine.tsx` | Chip sizing consistency |

## Acceptance Criteria

- [ ] Search bar is pill-shaped (`rounded-full`), 46px tall, with border
- [ ] Filter chips are 36px tall, rounded-full
- [ ] Active chips show electric lime background with dark text
- [ ] Routine body part chips use updated styling throughout
