# Tab Bar Restyling — Design Spec

**Date:** 2026-05-24
**Phase:** 11
**Status:** Approved

## Goal

Replace the full-width top-border active indicator with a small centered accent pill. Update tab bar colors to use Phase 8 tokens. Fix `lib/theme.ts` so React Navigation receives the correct palette.

## Files Changed

| File | Change |
|---|---|
| `lib/theme.ts` | Update THEME constants to Phase 8 hex values; expose `mutedForeground` |
| `components/navigation/tab-bar.tsx` | Small centered pill indicator; background/border/text color fixes |

## 1. lib/theme.ts

Update `THEME` constants to Phase 8 values and add `mutedForeground`:

### Dark
| Token | Value |
|---|---|
| `background` | `#0a0b0d` |
| `foreground` | `#f4f5f7` |
| `card` | `#15171b` |
| `primary` | `#d8fe3d` |
| `border` | `rgba(255,255,255,0.07)` |
| `destructive` | `#ff5868` |
| `mutedForeground` | `#6c6f78` |

### Light
| Token | Value |
|---|---|
| `background` | `#f6f6f3` |
| `foreground` | `#0a0b0d` |
| `card` | `#ffffff` |
| `primary` | `#d8fe3d` |
| `border` | `rgba(0,0,0,0.07)` |
| `destructive` | `#ff5868` |
| `mutedForeground` | `#8b8e96` |

`NAV_THEME` mapping stays the same — `colors.text` maps to `foreground`, `colors.background` maps to `background`, etc. The `mutedForeground` field is added to `THEME` but is NOT part of `NAV_THEME` (React Navigation doesn't support it); tab-bar.tsx reads it from `THEME` directly using the current Uniwind theme.

## 2. components/navigation/tab-bar.tsx

### Container
```
backgroundColor: colors.background   (was colors.card)
borderTopColor:  colors.border        (unchanged — but now correct hex)
borderTopWidth:  1                    (unchanged)
```

### Per-tab Pressable
- Add `position: 'relative'` to Pressable style
- Remove `borderTopWidth: 3` and `borderTopColor` from Pressable style

### Active indicator (new)
```tsx
{isFocused && (
  <View
    style={{
      position: 'absolute',
      top: 0,
      alignSelf: 'center',
      width: 24,
      height: 3,
      borderRadius: 2,
      backgroundColor: primary,
    }}
  />
)}
```

### Colors
- `primary` = `activeColor ?? colors.primary` (unchanged — accent store drives this)
- Active icon: `primary`
- Active label: `colors.text` (foreground)
- Inactive icon + label: `THEME[currentTheme].mutedForeground`
- `currentTheme` from `useUniwind().theme` (already available via import)

## Acceptance Criteria

- [ ] Active tab shows a 24×3px accent-colored pill at top center
- [ ] No full-width top border on active tab
- [ ] Inactive icon + label use `mutedForeground` color
- [ ] Active icon uses accent (`primary`), active label uses foreground
- [ ] Tab bar background is `#0a0b0d` (dark) / `#f6f6f3` (light)
- [ ] Tab bar top border uses Phase 8 border token
