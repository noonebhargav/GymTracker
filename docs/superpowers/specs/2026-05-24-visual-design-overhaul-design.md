# Visual Design System Overhaul — Design Spec

**Date:** 2026-05-24
**Phase:** 8
**Status:** Approved

## Goal

Replace the neutral shadcn theme tokens with a sporty, high-contrast dark/light palette. Swap the 9-color accent picker for 5 vibrant sporty colors. Change the default accent from `neutral` to Electric Lime.

## Files Changed

| File | Change |
|---|---|
| `global.css` | Replace all `--color-*` tokens for light and dark variants; add semantic danger/success/warn tokens |
| `lib/accent-colors.ts` | Replace 9-color array with 5-color array; update `applyAccentColor` to set `--color-primary-foreground` based on luminance |
| `app/(tabs)/settings.tsx` | AccentRow default state `'neutral'` → `'lime'` |
| `app/_layout.tsx` | AccentLoader fallback default `'neutral'` → `'lime'` |

## 1. global.css — Theme Tokens

### Dark (default)

| Token | Value |
|---|---|
| `--color-background` | `#0a0b0d` |
| `--color-foreground` | `#f4f5f7` |
| `--color-card` | `#15171b` |
| `--color-card-foreground` | `#f4f5f7` |
| `--color-popover` | `#15171b` |
| `--color-popover-foreground` | `#f4f5f7` |
| `--color-primary` | `#d8fe3d` |
| `--color-primary-foreground` | `#0a0b0d` |
| `--color-secondary` | `#1d2026` |
| `--color-secondary-foreground` | `#f4f5f7` |
| `--color-muted` | `#1d2026` |
| `--color-muted-foreground` | `#6c6f78` |
| `--color-accent` | `#15171b` |
| `--color-accent-foreground` | `#f4f5f7` |
| `--color-destructive` | `#ff5868` |
| `--color-border` | `rgba(255,255,255,0.07)` |
| `--color-input` | `rgba(255,255,255,0.15)` |
| `--color-ring` | `#d8fe3d` |
| `--color-sidebar` | `#15171b` |
| `--color-sidebar-foreground` | `#f4f5f7` |
| `--color-sidebar-primary` | `#d8fe3d` |
| `--color-sidebar-primary-foreground` | `#0a0b0d` |
| `--color-sidebar-accent` | `#1d2026` |
| `--color-sidebar-accent-foreground` | `#f4f5f7` |
| `--color-sidebar-border` | `rgba(255,255,255,0.07)` |
| `--color-sidebar-ring` | `#d8fe3d` |
| `--color-danger` | `#ff5868` |
| `--color-danger-soft` | `#2a1015` |
| `--color-success` | `#4ade80` |
| `--color-warn` | `#fbbf24` |

### Light variant

| Token | Value |
|---|---|
| `--color-background` | `#f6f6f3` |
| `--color-foreground` | `#0a0b0d` |
| `--color-card` | `#ffffff` |
| `--color-card-foreground` | `#0a0b0d` |
| `--color-popover` | `#ffffff` |
| `--color-popover-foreground` | `#0a0b0d` |
| `--color-primary` | `#d8fe3d` |
| `--color-primary-foreground` | `#0a0b0d` |
| `--color-secondary` | `#f3f3f0` |
| `--color-secondary-foreground` | `#0a0b0d` |
| `--color-muted` | `#f3f3f0` |
| `--color-muted-foreground` | `#8b8e96` |
| `--color-accent` | `#f3f3f0` |
| `--color-accent-foreground` | `#0a0b0d` |
| `--color-destructive` | `#ff5868` |
| `--color-border` | `rgba(0,0,0,0.07)` |
| `--color-input` | `rgba(0,0,0,0.10)` |
| `--color-ring` | `#d8fe3d` |
| `--color-sidebar` | `#ffffff` |
| `--color-sidebar-foreground` | `#0a0b0d` |
| `--color-sidebar-primary` | `#d8fe3d` |
| `--color-sidebar-primary-foreground` | `#0a0b0d` |
| `--color-sidebar-accent` | `#f3f3f0` |
| `--color-sidebar-accent-foreground` | `#0a0b0d` |
| `--color-sidebar-border` | `rgba(0,0,0,0.07)` |
| `--color-sidebar-ring` | `#d8fe3d` |
| `--color-danger` | `#ff5868` |
| `--color-danger-soft` | `#fff0f1` |
| `--color-success` | `#16a34a` |
| `--color-warn` | `#d97706` |

Note: `--color-chart-*` tokens are kept as-is (not replaced).

## 2. lib/accent-colors.ts — 5 Sporty Colors

| Name | Key | Hex | Primary Foreground |
|---|---|---|---|
| Electric Lime | `lime` | `#d8fe3d` | `#0a0b0d` (dark ink — light color) |
| Alarm Red | `red` | `#ff5868` | `#ffffff` (white ink — dark color) |
| Electric Blue | `blue` | `#5ec3ff` | `#0a0b0d` (dark ink — light color) |
| Dynamo Orange | `orange` | `#ff8a3d` | `#0a0b0d` (dark ink — medium-light) |
| Ultra Violet | `violet` | `#c476ff` | `#ffffff` (white ink — dark color) |

`applyAccentColor` updates `--color-primary`, `--color-primary-foreground`, `--color-ring`, and `--color-sidebar-primary` (both light and dark variants).

`LIGHT_DEFAULTS` and `DARK_DEFAULTS` updated to reflect lime as the default.

## 3. Settings & Layout — Default Accent

- `app/(tabs)/settings.tsx`: initial `accentColor` state `'neutral'` → `'lime'`; fallback in `getSetting` call `?? 'neutral'` → `?? 'lime'`; reset resets to `'lime'` instead of `'neutral'`
- `app/_layout.tsx`: AccentLoader fallback `accent !== 'neutral'` → `accent !== 'lime'`; default color lookup uses `'lime'`

## Acceptance Criteria

- [ ] Dark theme uses `#0a0b0d` background palette
- [ ] Light theme uses `#f6f6f3` background palette
- [ ] Primary accent is Electric Lime (`#d8fe3d`) by default
- [ ] Settings shows exactly 5 accent color dots
- [ ] Switching accent updates tab bar and all primary-colored elements immediately
- [ ] `--color-danger`, `--color-danger-soft`, `--color-success`, `--color-warn` tokens exist in both themes
- [ ] All existing screens render correctly with new tokens
