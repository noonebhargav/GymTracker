# Phase 14: Explore Tab Restyling

**Status:** pending

## Goal

Restyle the Explore landing page body part and equipment grids to match the design prototype. Enhance exercise detail screen. Keep existing exercise images from assets.

## Dependencies

- Phase 8 (Visual Design System)
- Phase 10 (Exercise Rows & Cards)

## Decisions

| Aspect | Decision |
|---|---|
| Body part tints | Skip — use neutral styling |
| Cards layout | 2-column grid, always visible (not collapsible) |
| Exercise images | Keep current asset-based images |
| Exercise detail | Add hero illustration area, numbered instructions with counter style, meta table |

## 1. Body Part Grid

Replace collapsible sections with always-visible 2-column grid:

```tsx
// Each body part card
<Pressable className="flex-1 bg-card border border-border rounded-[14px] p-4"
           onPress={() => router.push(`/explore/${group.toLowerCase()}`)}>
  <View className="w-9 h-9 rounded-[10px] bg-secondary mb-3 items-center justify-center">
    <Icon as={Dumbbell} className="size-5 text-muted-foreground" />
  </View>
  <Text className="text-base font-semibold text-foreground">{group}</Text>
  <Text className="text-xs text-muted-foreground mt-0.5">{count} exercises</Text>
</Pressable>
```

- 2 columns using `flex-row flex-wrap` with `w-1/2 p-1.5`
- No tint colors, neutral icon background
- Always visible (remove collapsible toggle)

## 2. Equipment Grid

Same 2-column grid pattern:

```tsx
<Pressable className="bg-card border border-border rounded-[14px] p-3.5"
           onPress={() => router.push(`/explore/${eq.toLowerCase()}`)}>
  <View className="flex-row items-center gap-2.5">
    <View className="w-10 h-10 rounded-[10px] bg-secondary items-center justify-center">
      {/* Equipment icon */}
    </View>
    <View className="min-w-0">
      <Text className="text-[13px] font-semibold text-foreground" numberOfLines={1}>{name}</Text>
      <Text className="text-[11px] text-muted-foreground mt-0.5">{count}</Text>
    </View>
  </View>
</Pressable>
```

## 3. Exercise Detail (Hero + Instructions)

**Files**: `app/(tabs)/explore/[filter]/[id].tsx` and `app/exercise-detail/[id].tsx`

### Hero Illustration Area
```tsx
<View className="mx-4 mt-2 mb-4 bg-card border border-border rounded-[20px] py-8 items-center justify-center overflow-hidden">
  {/* Diagonal pattern overlay */}
  <View className="absolute inset-0 opacity-5" style={{
    backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 12px, rgba(255,255,255,0.02) 12px 13px)'
  }} />
  <Image source={gifSource} className="w-48 h-48" resizeMode="contain" />
</View>
```

### Meta Table
```
Target         Pectorals
Group          Chest
Equipment      Barbell
Secondary      Triceps   Shoulders   (pill badges)
```

### Numbered Instructions
```tsx
{steps.map((step, i) => (
  <View key={i} className="flex-row gap-3.5 py-3 border-b border-border">
    <Text className="text-xs font-bold text-primary w-6 mt-0.5 tabular-nums">
      {String(i + 1).padStart(2, '0')}
    </Text>
    <Text className="text-sm text-foreground flex-1 leading-relaxed">{step}</Text>
  </View>
))}
```

## 4. Section Headers

Add section headers between grids (matches design):
```tsx
<View className="flex-row items-baseline justify-between px-5 pt-2 pb-3">
  <Text className="text-lg font-bold text-foreground">Body parts</Text>
  <Text className="text-xs text-muted-foreground">{count}</Text>
</View>
```

## Files Changed

| File | Change |
|---|---|
| `app/(tabs)/explore/index.tsx` | Replace collapsible sections with 2-col grids; add section headers |
| `app/(tabs)/explore/[filter]/[id].tsx` | Add hero illustration area, restyle meta table, numbered instructions |
| `app/exercise-detail/[id].tsx` | Same hero + instructions enhancements |

## Acceptance Criteria

- [ ] Body parts shown as 2-column grid of cards (always visible, not collapsible)
- [ ] Equipment shown as 2-column grid of cards
- [ ] Section headers with count shown above each grid
- [ ] Exercise detail shows large hero illustration with pattern overlay
- [ ] Instructions numbered with leading-zero style (01, 02, 03...)
- [ ] Existing exercise images from assets still displayed
- [ ] No body part tint colors used
