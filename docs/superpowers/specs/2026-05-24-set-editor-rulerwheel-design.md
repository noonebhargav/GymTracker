# Set Editor with RulerWheel — Design Spec

**Date:** 2026-05-24
**Phase:** 12
**Status:** Approved

## Goal

Replace stepper-button set editor with a RulerWheel bottom-sheet picker. Add Today's session card, streak counter, PR badge, and settings RulerWheel integration.

## Files Changed

| File | Change |
|---|---|
| **New** `components/ui/ruler-wheel.tsx` | RulerWheel bottom-sheet picker |
| `app/(tabs)/workout/[tab]/[id].tsx` | Rewrite set rows with field buttons + RulerWheel; PR badge |
| `components/workout-screen.tsx` | Today's session card; streak counter in header |
| `app/(tabs)/settings.tsx` | Weight/reps StepperRow → RulerWheel trigger |
| `lib/database.ts` | Add `getWorkoutStreak()` and `getExercisePRHistory()` |

---

## 1. RulerWheel Component

**File:** `components/ui/ruler-wheel.tsx`

### Props

```tsx
interface RulerWheelProps {
  title: string;          // e.g. "SET 1 · WEIGHT"
  value: number;
  onChange: (v: number) => void;
  min?: number;           // default 0
  max?: number;           // default 500 for weight, 50 for reps
  step?: number;          // default 5 (lbs weight), 2.5 (kg weight), 1 (reps)
  unit: string;           // "lbs", "kg", "reps"
  quickSteps?: number[];  // default [-10, -5, 5, 10, 25] for lbs/kg; [-5, -1, 1, 5] for reps
  onDone: () => void;
}
```

### Layout

```
Modal overlay (position absolute, full screen)
├── Backdrop: Pressable, rgba(0,0,0,0.35), tap to dismiss (calls onDone)
└── Sheet: slides up from bottom, bg-card, rounded-t-[24px], pb = safeArea.bottom
    ├── Handle bar: 4×40px, bg-muted, rounded-full, mx-auto, mt-3 mb-2
    ├── Header row: px-5 py-3
    │   ├── Title: text-xs font-semibold text-muted-foreground uppercase tracking-widest
    │   └── Done button: bg-primary rounded-full px-4 py-1.5
    │       Text: text-xs font-bold text-primary-foreground "Done"
    ├── Value display: text-[44px] font-bold text-foreground text-center py-2
    │   with unit as text-lg text-muted-foreground suffix
    ├── Ruler strip (height 80px, position relative):
    │   ├── ScrollView: horizontal, showsHorizontalScrollIndicator=false
    │   │   snapToInterval={TICK_WIDTH}, decelerationRate="fast"
    │   │   Padding: left/right = screenWidth/2 (centers value at pin)
    │   │   Content: array of ticks from min to max/step
    │   │   Major tick (every 5th): h-[22px] + label below (text-[10px] muted)
    │   │   Minor tick: h-[10px], no label
    │   │   Tick width: TICK_WIDTH = 12px, bg-border (minor), bg-muted-foreground (major)
    │   └── Center pin: absolute, top-0, left=screenWidth/2, w-[2px], h-full, bg-primary
    └── Quick-jump buttons: flex-row gap-2 px-5 py-4
        Each: bg-secondary rounded-xl px-3 h-9 text-sm font-semibold text-foreground
```

### Scroll Behavior

- `onMomentumScrollEnd` reads `contentOffset.x / TICK_WIDTH` → derives value
- Fires `onChange(newValue)` and updates displayed value
- On mount, scroll to initial value position: `scrollRef.scrollTo({ x: (value - min) / step * TICK_WIDTH, animated: false })`
- Quick-jump buttons call `scrollRef.scrollTo({ x: ..., animated: true })` then fire `onChange`

### Animation

Use `react-native-reanimated` `FadeIn` for backdrop, `SlideInDown` (entering from bottom) for sheet. No exit animation needed — sheet unmounts on done/dismiss.

---

## 2. Set Editor Rewrite

**File:** `app/(tabs)/workout/[tab]/[id].tsx`

### Set Row Layout

```
Row: flex-row items-center gap-2 mb-3

Left:  View circle w-9 h-9 rounded-full bg-secondary items-center justify-center
       Text "1" text-sm font-bold text-muted-foreground

Middle: flex-row gap-2 flex-1
  Weight card (flex-1):
    Pressable bg-secondary rounded-xl p-2 items-center
    border-2 border-transparent (border-primary when RulerWheel open for this field)
    Label: text-[10px] font-semibold text-muted-foreground uppercase tracking-wider "Weight"
    Value: font-bold text-[22px] text-foreground tabular-nums "{weight}"
    Unit:  text-xs text-muted-foreground " {unit}"

  Reps card (flex-1): same pattern, label "Reps", value "{reps} reps"

Right: Pressable size-9 items-center justify-center rounded-full active:bg-destructive/10
       Icon MinusCircle size-5 text-destructive (only if setValues.length > 1)
```

### RulerWheel State

```tsx
const [rulerWheel, setRulerWheel] = useState<{
  setIdx: number;
  field: 'weight' | 'reps';
} | null>(null);
```

Opening: `setRulerWheel({ setIdx: idx, field: 'weight' })`. Closing: `setRulerWheel(null)`.

The RulerWheel renders as a modal overlay when `rulerWheel !== null`, with title `SET ${rulerWheel.setIdx + 1} · ${rulerWheel.field.toUpperCase()}`.

### PR Tracking

New DB function: `getExercisePRHistory(db, exerciseId): Promise<number>` — returns max weight ever logged for that exercise before today.

After saving a set via the log button:
- Compare `Math.max(...setValues.map(s => s.weight))` against historical max
- If current session max > historical max: show PR banner in header
  ```tsx
  <View className="flex-row items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
    <Icon as={Trophy} className="size-3.5 text-primary" />
    <Text className="text-xs font-bold text-primary">PR — {sessionMax} {unit}</Text>
  </View>
  ```
- PR state resets when navigating away

---

## 3. Today's Session Card

**File:** `components/workout-screen.tsx` — inserted above the exercise FlatList

Renders when `completedToday.size > 0`:

```tsx
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
      return e ? <DoneBadge key={id} label={capitalizeWords(e.name)} /> : null;
    })}
  </View>
</View>
```

Use a local `SessionPill` component (defined inline in `workout-screen.tsx`) rather than extending the shared `DoneBadge`. Same visual style (`bg-primary rounded-full px-2.5 py-1`) but renders a text label instead of "Done".

---

## 4. Streak Counter

**File:** `components/workout-screen.tsx` — shown in workout screen header below day name

New DB function: `getWorkoutStreak(db): Promise<number>` — counts consecutive days ending at today (or yesterday if nothing logged today yet) with at least one workout log. Implementation: fetch distinct `date_logged` values ordered DESC, walk until gap found.

Display:
```tsx
{streak > 0 && (
  <View className="flex-row items-center gap-1.5 mt-0.5">
    <Icon as={Flame} className="size-3.5 text-warn" />
    <Text className="text-xs font-bold text-foreground">{streak}</Text>
    <Text className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">day streak</Text>
  </View>
)}
```

Loaded on `useFocusEffect` alongside other workout data.

---

## 5. Settings RulerWheel

**File:** `app/(tabs)/settings.tsx`

Replace the `StepperRow` for Weight and Reps with a tappable display row:

```tsx
// Weight row
<Pressable
  className="flex-row items-center px-4 py-3 border-b border-border"
  onPress={() => setRulerOpen('weight')}
>
  <Text className="text-base text-foreground flex-1">Weight</Text>
  <Text className="text-base font-semibold text-foreground tabular-nums">
    {defaultWeight} {weightUnit}
  </Text>
</Pressable>
```

RulerWheel state: `const [rulerOpen, setRulerOpen] = useState<'weight' | 'reps' | null>(null)`. Opens appropriate sheet; on `onChange`, updates state and persists to DB. `onDone` closes sheet.

Sets stepper (`StepperRow` with Minus/Plus) remains unchanged.

---

## Acceptance Criteria

- [ ] Tapping weight/reps card opens RulerWheel sheet with correct title, value, unit
- [ ] Ruler scrolls and snaps to step intervals, value display updates on scroll end
- [ ] Quick-jump buttons adjust value and scroll ruler to new position
- [ ] Done button and backdrop tap both close the sheet
- [ ] Active field card shows `border-primary` while sheet open
- [ ] Set rows show set number circle, weight card, reps card, remove button
- [ ] Add/remove sets works unchanged
- [ ] PR badge appears in header when session max weight exceeds historical max
- [ ] Today's session card shows when exercises completed, with name pills
- [ ] Streak counter shows in workout header when streak ≥ 1
- [ ] Settings weight/reps rows open RulerWheel; Sets stepper unchanged
- [ ] `getWorkoutStreak` and `getExercisePRHistory` added to database.ts
