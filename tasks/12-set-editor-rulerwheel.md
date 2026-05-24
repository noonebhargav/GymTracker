# Phase 12: Set Editor with RulerWheel Picker

**Status:** pending

## Goal

Replace the current stepper-button + TextInput set editor with the design prototype's RulerWheel bottom-sheet picker. Add "Today's session" summary card and PR tracking to the Workout tab.

## Dependencies

- Phase 8 (Visual Design System)
- Phase 10 (Exercise Rows & Cards)
- Phase 5 (existing Workout Tab — all DB/logic already in place)

## Decisions

| Aspect | Decision |
|---|---|
| RulerWheel picker | Replace steppers for weight and reps |
| Per-set done toggle | Skip — not needed |
| PR tracking | Track per exercise (compare against historical max weight) |
| Last performance reference | Skip — last workout values already used as defaults |
| Settings stepper | Replace with RulerWheel for weight/reps in settings too |
| "Today's session" card | Add — shows done exercises with check pills |

## 1. RulerWheel Component

**New file**: `components/ui/ruler-wheel.tsx`

### Design Spec

```
Bottom sheet overlay:
├── SheetBackdrop (semi-transparent bg, tap to dismiss)
└── RulerWheel sheet (slides up from bottom)
    ├── Header: "SET 1 · WEIGHT" title + "Done" chip button
    ├── Large value display: "45 lbs" (44px, center, Space Grotesk → use system bold)
    ├── Scrollable ruler strip:
    │   ├── Track of tick marks (major: 22px tall + label, minor: 10px)
    │   ├── Center pin: accent-colored vertical line with glow
    │   └── Snap-to-value on scroll
    └── Quick-jump buttons: -10, -5, +5, +10, +25 (contextual by unit)
```

### Props

```tsx
interface RulerWheelProps {
  title: string;           // "SET 1 · WEIGHT"
  value: number;
  onChange: (v: number) => void;
  min?: number;            // default 0
  max?: number;            // default 500 for weight, 50 for reps
  step?: number;           // default 5 for lbs, 2.5 for kg weight; 1 for reps
  unit: string;            // "lbs", "kg", "reps"
  quickSteps?: number[];   // default [-10, -5, 5, 10, 25] for lbs
  onDone: () => void;
}
```

### Implementation Notes

- Use `ScrollView` with `horizontal`, `snapToInterval={TICK_WIDTH}`, `showsHorizontalScrollIndicator={false}`
- TICK_WIDTH = 12px (matches design)
- Center pin: absolutely positioned View at 50% width
- Major ticks every 5th step, minor ticks otherwise
- Animate slide-up with `react-native-reanimated` (`FadeIn` / `SlideInUp` or custom)
- Backdrop: `Pressable` with `rgba(0,0,0,0.35)` background, closes on press

## 2. Updated Set Editor Screen

**File**: `app/(tabs)/workout/[tab]/[id].tsx` (major rewrite)

### Set Row Design

Each set is a card with:
- Set number (circle, 36px, `bg-secondary`) — or when done? Skip the done toggle
- Weight field button → opens RulerWheel for weight
- Reps field button → opens RulerWheel for reps
- Remove button (X icon, red on hover)
- Active field gets accent border highlight

### Set Field Button

```tsx
<Pressable className="flex-1 bg-secondary border-2 border-transparent rounded-xl p-2 items-center
  data-[active=true]:border-primary"
  onPress={() => openRulerWheel(idx, 'weight')}>
  <Text className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Weight</Text>
  <Text className="font-bold text-[22px] text-foreground mt-0.5 tabular-nums">
    {set.weight}<Text className="text-xs text-muted-foreground font-medium ml-1">{unit}</Text>
  </Text>
</Pressable>
```

### PR Tracking

- After saving sets, compare max weight in this session vs historical max from `workout_logs` table
- Show PR badge (trophy icon + "PR {weight} {unit}") if new max is set
- Query: `SELECT MAX(weight) FROM workout_logs WHERE exercise_id = ? AND date_logged < ?`

### "Today's Session" Card

Added to `components/workout-screen.tsx`:
```tsx
{completedToday.size > 0 && (
  <View className="mx-4 mb-3 bg-secondary rounded-[14px] p-4">
    <View className="flex-row items-center justify-between mb-2.5">
      <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
        Today's session
      </Text>
      <Text className="text-[13px] font-bold text-foreground tabular-nums">
        {completedToday.size} done
      </Text>
    </View>
    <View className="flex-row flex-wrap gap-1.5">
      {[...completedToday].map(id => {
        const e = exercises.find(ex => ex.id === id);
        return e ? (
          <View key={id} className="flex-row items-center gap-1 bg-primary rounded-full px-2.5 py-1">
            <Icon as={Check} className="size-3 text-primary-foreground" />
            <Text className="text-xs font-semibold text-primary-foreground" numberOfLines={1}>
              {capitalizeWords(e.name)}
            </Text>
          </View>
        ) : null;
      })}
    </View>
  </View>
)}
```

## 3. Settings — Replace Steppers with RulerWheel

In `app/(tabs)/settings.tsx`, for the Weight and Reps defaults:
- Tapping the value opens a RulerWheel modal/sheet
- Keep the Sets stepper as-is (small range, no wheel needed)

## 4. Workout Streak Counter

Add to the Workout header in `components/workout-screen.tsx`:
```tsx
// Next to the title, show flame icon + streak count
<View className="flex-row items-center gap-2">
  <Icon as={Flame} className="size-3.5 text-muted-foreground" />
  <Text className="font-bold text-sm text-foreground">{streak}</Text>
  <Text className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">day streak</Text>
</View>
```

Compute streak from DB: count consecutive days with at least one logged exercise ending at today.

## Files Changed

| File | Change |
|---|---|
| **New**: `components/ui/ruler-wheel.tsx` | RulerWheel bottom-sheet picker component |
| `app/(tabs)/workout/[tab]/[id].tsx` | Rewrite set editor: set row cards with field buttons → RulerWheel; add PR tracking |
| `components/workout-screen.tsx` | Add "Today's session" card; add streak counter |
| `app/(tabs)/settings.tsx` | Replace weight/reps steppers with RulerWheel trigger |
| `lib/database.ts` | Add streak query and PR history query if needed |

## Acceptance Criteria

- [ ] Tapping a weight/reps field opens the RulerWheel bottom sheet
- [ ] RulerWheel snaps to stepped values on scroll, shows large current value
- [ ] Quick-jump buttons adjust value correctly
- [ ] "Done" button dismisses the sheet
- [ ] Tapping backdrop dismisses the sheet
- [ ] Set rows show weight and reps in styled field cards
- [ ] Active field (being edited) has accent border
- [ ] Add/remove sets works
- [ ] PR badge appears when a new max weight is set for that exercise
- [ ] "Today's session" card shows completed exercises with check pills
- [ ] Streak counter shows in Workout header
- [ ] Settings weight/reps open RulerWheel instead of steppers
