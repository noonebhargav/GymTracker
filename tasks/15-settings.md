# Phase 15: Settings Tab Restructure

**Status:** pending

## Goal

Restructure Settings: add About section with export capability, restyle the reset button, and replace weight/reps stepper buttons with RulerWheel picker.

## Dependencies

- Phase 8 (Visual Design System)
- Phase 12 (Set Editor — RulerWheel component must exist)

## Decisions

| Aspect | Decision |
|---|---|
| Theme toggle | Keep current segmented control (Light / System / Dark) |
| About section | Add Export workout data row |
| Reset button | Style as `bg-danger-soft text-danger` full-width button (no AlertDialog, use simple confirmation) |
| Weight/reps steppers | Replace with RulerWheel picker on tap |

## 1. About Section

Add between Appearance and Danger Zone:

```tsx
<SectionHeader title="About" />
<View className="px-4 py-3 border-b border-border">
  <Pressable className="flex-row items-center justify-between w-full" onPress={handleExport}>
    <Text className="text-base text-foreground">Export workout data</Text>
    <Icon as={ChevronRight} className="size-5 text-muted-foreground" />
  </Pressable>
</View>
```

Export implementation: Use `expo-sharing` and `expo-file-system` to export workout_logs as JSON/CSV. Or keep as placeholder (Share API with JSON string).

## 2. Reset Button Restyling

Replace the AlertDialog wrapper with a simpler styled button:

```tsx
<SectionHeader title="Danger Zone" />
<View className="px-4 py-4">
  <Pressable
    onPress={handleReset}
    className="w-full h-[52px] rounded-[14px] bg-danger-soft border border-danger/20 items-center justify-center active:opacity-80"
  >
    <View className="flex-row items-center gap-2">
      <Icon as={TriangleAlert} className="size-4 text-destructive" />
      <Text className="text-base font-bold text-destructive">Reset all data</Text>
    </View>
  </Pressable>
</View>
```

Use a simple `Alert.alert()` confirmation before resetting instead of the custom AlertDialog component.

## 3. Weight & Reps RulerWheel

Replace the `StepperRow` component for weight and reps defaults:

- Tapping the value opens a RulerWheel modal/sheet (reuse `components/ui/ruler-wheel.tsx`)
- Keep the Sets stepper as-is (narrow range, Minus/Plus buttons fine for 2-6)
- Weight RulerWheel: min 0, max 999, step 5/2.5 depending on unit
- Reps RulerWheel: min 0, max 99, step 1

## Files Changed

| File | Change |
|---|---|
| `app/(tabs)/settings.tsx` | Add About section; replace reset button style; replace weight/reps steppers with RulerWheel triggers |

## Acceptance Criteria

- [ ] About section shows Export workout data row
- [ ] Export row is tappable, shares workout data as JSON
- [ ] Reset button uses danger-soft bg + danger text, no AlertDialog
- [ ] Tapping weight/reps value opens RulerWheel picker
- [ ] Sets stepper remains as-is
- [ ] Theme, accent, units, mode sections unchanged

---

## Cleanup

After all tasks (08–15) are completed and confirmed by the user, remove the `/design/` directory from the project:

```bash
rm -rf design/
```
