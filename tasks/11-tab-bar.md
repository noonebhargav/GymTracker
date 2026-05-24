# Phase 11: Bottom Tab Bar Restyling

**Status:** done

## Goal

Restyle the bottom tab bar to match the design prototype's active indicator style.

## Dependencies

- Phase 8 (Visual Design System) — needs new color tokens

## Changes

### Current (`components/navigation/tab-bar.tsx`)

- Full-width top border on active tab (`borderTopWidth: 3`)
- Uses React Navigation's `BottomTabBarProps`
- `activeColor` from accent store

### Design Changes

1. **Keep current height** — no change to tab bar height
2. **Active indicator**: Replace full-width `borderTopWidth: 3` with a small centered accent bar (24px wide × 3px tall, rounded, `--accent` color) positioned at the top of the active tab
3. **Inactive tabs**: Icon + label in `text-muted-foreground` (already `colors.text` from React Navigation theme — will match new tokens)
4. **Active tab**: Icon in accent color (`--primary`), label in `text-foreground`
5. **Background**: `bg-background` with `border-t border-border`

### Implementation

Keep the existing `TabBar` component structure but change the indicator:

```tsx
// Instead of borderTopWidth on the Pressable:
// Add a small View at top-center of each tab button
{isFocused && (
  <View className="absolute top-0 w-6 h-[3px] rounded-[2px] bg-primary" 
        style={{ alignSelf: 'center' }} />
)}
```

Remove the `borderTopWidth` / `borderTopColor` styles from the Pressable.

### Files Changed

| File | Change |
|---|---|
| `components/navigation/tab-bar.tsx` | Small centered accent bar indicator; update active/inactive colors |

## Acceptance Criteria

- [ ] Active tab shows a 24×3px accent-colored bar centered at top
- [ ] Inactive tabs have muted-foreground color
- [ ] Active tab icon is accent-colored, label is foreground-colored
- [ ] Tab bar background uses new tokens (`bg-background`, `border-t border-border`)
- [ ] No full-width top border on active tab
