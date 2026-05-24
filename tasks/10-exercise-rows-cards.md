# Phase 10: Exercise Rows & Cards

**Status:** pending

## Goal

Update exercise list rows to match the design prototype styling. Unify card styling across all screens.

## Dependencies

- Phase 8 (Visual Design System) — needs new surface/border tokens

## 1. Exercise Rows

### Design Spec
```
Container: flex-row, items-center, gap-3, px-4, py-3.5 (--row-pad-y)
  border-b border-border, bg-transparent (hover: bg-surface, active: bg-surface-2)

Thumbnail: w-[52px] h-[52px], rounded-[12px], bg-secondary
  grid place-items-center, overflow-hidden
  Diagonal pattern overlay (optional — nice to have, not blocking)

Meta: flex-1, min-w-0
  Name: font-semibold, text-[15px], text-foreground
  Sub: text-[13px], text-muted-foreground, mt-0.5
       "{equipment} · {bodypart/group}"

Right: chevron-right icon (text-muted-foreground) OR done badge
```

### Done Badge
```tsx
// Pill with accent bg + dark text + check icon
<View className="flex-row items-center gap-1 bg-primary rounded-full px-2.5 py-1">
  <Icon as={Check} className="size-3 text-primary-foreground" />
  <Text className="text-xs font-semibold text-primary-foreground">Done</Text>
</View>
```

### Pattern Overlay on Thumbnail (Optional)

The design adds a diagonal stripe pattern via `::before`. In RN this can be done with a `View` with `repeating-linear-gradient` background or simply skipped for now. Mark as nice-to-have.

### Files Using Exercise Rows

| File | Role |
|---|---|
| `components/workout-screen.tsx` — `WorkoutExerciseRow` | Workout exercise list |
| `app/(tabs)/explore/index.tsx` — `ExerciseListItem` | Explore search results |
| `app/(tabs)/explore/[filter]/index.tsx` | Filtered exercise list |
| `app/(tabs)/history/[date].tsx` | Day detail exercise groups (uses inline, not shared component) |

### Recommended: Extract Shared Component

Create `components/exercise-row.tsx` with:
```tsx
interface ExerciseRowProps {
  name: string;
  equipment: string;
  group: string;
  assetId: string | null;
  imageSource?: ImageSourcePropType;
  right?: ReactNode;     // chevron, done badge, or custom
  onPress?: () => void;
}
```

Then reuse across all screens.

## 2. Cards

### Design Spec
```tsx
<View className="bg-card border border-border rounded-[14px] p-4">
  ...
</View>
```

With the new tokens:
- `bg-card` = `#15171b` (dark) / `#ffffff` (light)
- `border-border` = `rgba(255,255,255,0.07)` (dark) / `rgba(0,0,0,0.07)` (light)

### Dashed Card Variant (Empty States)

```tsx
// For rest days, no-data weeks, empty routine days
<View className="border border-dashed border-border bg-transparent rounded-[14px] p-4">
  ...
</View>
```

Note: `border-dashed` may not work on React Native. Use `borderStyle: 'dashed'` via inline style if needed.

### Files Using Cards

Most screens already use card-like containers (rounded-xl, border-border, etc.). The radius needs updating from `rounded-xl` (12px) to match the design's `rounded-[14px]` (--radius: 14px). However, the current radius system in `global.css` has:
- `--radius: 10px`, `--radius-xl: 14px`

If we keep current radius system, `rounded-xl` = 14px which matches the design. So no radius change needed for cards — just ensure consistent `bg-card border border-border` usage.

## 3. Key Files to Update

| File | Change |
|---|---|
| **New**: `components/exercise-row.tsx` | Extract shared exercise row component |
| `components/workout-screen.tsx` | Use shared ExerciseRow; remove `WorkoutExerciseRow` |
| `app/(tabs)/explore/index.tsx` | Use shared ExerciseRow for search results |
| `app/(tabs)/explore/[filter]/index.tsx` | Use shared ExerciseRow |
| `app/(tabs)/history/[date].tsx` | Use shared ExerciseRow for day detail exercises |
| `app/(tabs)/routine.tsx` | Ensure cards use `bg-card border border-border` |
| `app/(tabs)/history/index.tsx` | Dashed border for empty week cards |

## Acceptance Criteria

- [ ] All exercise list rows use consistent styling (name, equipment · group, thumbnail, chevron/done badge)
- [ ] Done badge is electric lime background with dark text and check icon
- [ ] Cards across app use `bg-card border border-border rounded-[14px]`
- [ ] Empty state cards use dashed border style
- [ ] Extracted `ExerciseRow` component is reusable with minimal props
