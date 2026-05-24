# Exercise Rows & Cards — Design Spec

**Date:** 2026-05-24
**Phase:** 10
**Status:** Approved

## Goal

Extract a shared `ExerciseRow` component, update row styling to match design prototype, update done badge to solid lime, and tighten card styling in history screens.

## Files Changed

| File | Change |
|---|---|
| **New** `components/exercise-row.tsx` | Shared exercise row component |
| `components/workout-screen.tsx` | Replace `WorkoutExerciseRow` with shared component |
| `app/(tabs)/explore/index.tsx` | Replace `ExerciseListItem` with shared component |
| `app/(tabs)/explore/[filter]/index.tsx` | Replace inline row with shared component |
| `app/(tabs)/history/[date].tsx` | Update thumbnail/text styling inline (not pressable, skip shared component) |
| `app/(tabs)/history/index.tsx` | Add `bg-card` to week cards |

## 1. Shared ExerciseRow Component

**File:** `components/exercise-row.tsx`

```tsx
interface ExerciseRowProps {
  name: string;
  equipment: string;
  group: string;           // gold standard group label (e.g. "Chest")
  assetId: string | null;
  right?: ReactNode;       // chevron icon, done badge, or omit
  onPress?: () => void;
}
```

### Row Layout

```
Container: Pressable, active:bg-muted
  Inner:  flex-row items-center px-4 py-3.5 border-b border-border gap-3

Thumbnail (has image):  Image w-[52px] h-[52px] rounded-[12px] bg-secondary
Thumbnail (no image):   View  w-[52px] h-[52px] rounded-[12px] bg-secondary items-center justify-center
                          Icon as={Dumbbell} size-6 text-muted-foreground

Meta (flex-1 min-w-0):
  Name:  Text font-semibold text-[15px] text-foreground numberOfLines={2}
  Sub:   Text text-[13px] text-muted-foreground mt-0.5
         "{capitalizeWords(equipment) || 'N/A'}{group ? ` · ${group}` : ''}"

Right:  {right} — rendered as-is at the trailing edge
```

Placeholder icon changes from `Search` → `Dumbbell` (more semantically correct for exercises).

### Done Badge

```tsx
// Exported from exercise-row.tsx as DoneBadge
<View className="flex-row items-center gap-1 bg-primary rounded-full px-2.5 py-1">
  <Icon as={Check} className="size-3 text-primary-foreground" />
  <Text className="text-xs font-semibold text-primary-foreground">Done</Text>
</View>
```

Solid `bg-primary` (electric lime) replaces the old `bg-primary/20 border border-primary/40` muted tint.

### Chevron

```tsx
// Standard right element
<Icon as={ChevronRight} className="size-4 text-muted-foreground" />
```

Chevron and done badge are **mutually exclusive** — passed via `right` prop, not rendered internally.

## 2. Consumer Updates

### workout-screen.tsx
- Delete `WorkoutExerciseRow`
- Import `ExerciseRow`, `DoneBadge` from `@/components/exercise-row`
- Pass `right={isDone ? <DoneBadge /> : <ChevronIcon />}`
- Derive `group` via `toGoldStandardGroup(item.body_part, item.target)`

### explore/index.tsx
- Delete `ExerciseListItem`
- Import `ExerciseRow` from `@/components/exercise-row`
- Pass `right={<ChevronIcon />}`
- Derive `group` via `toGoldStandardGroup(item.body_part, item.target)` (currently omitted from sub — now shown)

### explore/[filter]/index.tsx
- Replace inline Pressable/View row with `ExerciseRow`
- Pass `group` derived from `toGoldStandardGroup(item.body_part, item.target)`

### history/[date].tsx
- Not a pressable row — keep inline structure
- Update thumbnail: `size-10 rounded-md bg-muted` → `w-[52px] h-[52px] rounded-[12px] bg-secondary`
- Update name: keep `text-sm font-semibold` (already semibold — leave as-is, close enough)
- Update placeholder icon: `Search` → `Dumbbell`

## 3. Card Updates

### history/index.tsx
- Week cards already have `rounded-xl border border-border` (solid) and `border-dashed border-border` (empty)
- Add `bg-card` to make background explicit: `rounded-xl p-4 bg-card border ...`

## Acceptance Criteria

- [ ] `components/exercise-row.tsx` exists and exports `ExerciseRow` and `DoneBadge`
- [ ] Thumbnail is 52×52px, `rounded-[12px]`, `bg-secondary`
- [ ] Placeholder shows Dumbbell icon instead of Search
- [ ] Name is `font-semibold text-[15px]`, sub is `text-[13px]`
- [ ] Sub shows `equipment · group` in all three exercise list screens
- [ ] Done badge is solid `bg-primary` with `text-primary-foreground` (electric lime + dark text)
- [ ] Chevron and done badge are mutually exclusive
- [ ] `WorkoutExerciseRow` and `ExerciseListItem` are removed
- [ ] `history/[date].tsx` thumbnail updated to 52px with `bg-secondary`
- [ ] `history/index.tsx` week cards include `bg-card`
