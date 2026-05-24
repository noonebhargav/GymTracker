# Explore Tab Restyling Design

**Date:** 2026-05-24  
**Status:** Approved

## Overview

Restyle the Explore landing page to replace collapsible sections with always-visible 2-column grids (no icons). Enhance exercise detail screens with a rounded hero illustration card, cleaner meta table, and leading-zero numbered instructions.

---

## File Structure

```
app/(tabs)/explore/index.tsx          ← remove collapsibles, new card grid styles
app/(tabs)/explore/[filter]/[id].tsx  ← hero card, meta table, numbered instructions
app/exercise-detail/[id].tsx          ← same hero + instructions changes
```

No new files. No new DB queries.

---

## Section 1 — Explore Landing (`index.tsx`)

### Remove
- `CollapsibleSection` component and all its usage
- `bodyPartsOpen`, `equipmentOpen` state
- `ChevronDown`, `ChevronRight` imports (no longer needed)

### Section header
Rendered above each grid:
```tsx
<View className="flex-row items-baseline justify-between px-5 pt-4 pb-3">
  <Text className="text-lg font-bold text-foreground">{title}</Text>
  <Text className="text-xs text-muted-foreground">{count}</Text>
</View>
```

### Body part cards
2-column grid using `flex-row flex-wrap px-3`. Each card takes `w-1/2 p-1.5`:
```tsx
<Pressable className="flex-1 bg-card border border-border rounded-[14px] p-4"
           onPress={...}>
  <Text className="text-base font-semibold text-foreground">{group}</Text>
  <Text className="text-xs text-muted-foreground mt-0.5">{count} exercises</Text>
</Pressable>
```
No icon.

### Equipment cards
Same 2-column grid pattern, slightly different padding:
```tsx
<Pressable className="flex-1 bg-card border border-border rounded-[14px] p-3.5"
           onPress={...}>
  <Text className="text-[13px] font-semibold text-foreground" numberOfLines={1}>
    {name}
  </Text>
  <Text className="text-[11px] text-muted-foreground mt-0.5">{count} exercises</Text>
</Pressable>
```
No icon.

### Unchanged
- Search bar and search results
- Loading state
- `groupCounts`, `equipmentCounts` logic
- Navigation routes

---

## Section 2 — Exercise Detail (both screens)

Applied identically to `app/(tabs)/explore/[filter]/[id].tsx` and `app/exercise-detail/[id].tsx`.

### Hero illustration card
Replace the current full-width image container with a rounded card:
```tsx
<View className="mx-4 mt-2 mb-4 bg-card border border-border rounded-[20px] py-8 items-center overflow-hidden">
  <Image source={gifSource} className="w-48 h-48" resizeMode="contain" />
</View>
```
No pattern overlay (CSS `repeating-linear-gradient` not supported in React Native).
If no `gifSource`, render nothing (same as current behaviour).

### Meta table
Keep existing `DetailRow` component. Labels: Target, Group (was "Muscle Group"), Equipment, Secondary. Secondary muscles remain as `bg-muted rounded-full px-3 py-1` pill badges. No structural change — verify label text matches "Group" not "Muscle Group".

### Numbered instructions
Replace current `{i + 1}.` style with:
```tsx
<View key={i} className="flex-row gap-3.5 py-3 border-b border-border">
  <Text className="text-xs font-bold text-primary w-6 mt-0.5 tabular-nums">
    {String(i + 1).padStart(2, '0')}
  </Text>
  <Text className="text-sm text-foreground flex-1 leading-relaxed">{step}</Text>
</View>
```

---

## Acceptance Criteria

- [ ] Body parts shown as always-visible 2-column grid of cards (no icons, no collapsible)
- [ ] Equipment shown as always-visible 2-column grid of cards (no icons)
- [ ] Section headers with bold title and muted count shown above each grid
- [ ] Exercise detail shows hero illustration in rounded `bg-card` container
- [ ] Instructions numbered with leading-zero style (01, 02, 03…)
- [ ] "Muscle Group" label changed to "Group" in meta table
- [ ] Changes applied to both exercise detail screens
- [ ] Search mode unchanged
