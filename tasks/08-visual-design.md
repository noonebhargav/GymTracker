# Phase 8: Visual Design System Overhaul

**Status:** done

## Goal

Replace the current shadcn neutral theme tokens with the sporty, high-contrast dark palette from the design prototype. Update accent colors to the 5-color sporty set. Add light theme variant and shadow tokens.

## Decisions

| Aspect | Decision |
|---|---|
| **Color Palette** | Use design prototype's sporty dark palette |
| **Typography** | Keep current system fonts (no Space Grotesk) |
| **Accent Colors** | Replace 9 colors with design's 5 sporty colors |
| **Density** | Skip — no density classes |
| **Body Part Tints** | Skip — no tinted body part indicators |
| **Light Theme** | Add design prototype's light variant |
| **Shadows** | Add design prototype's shadow tokens |
| **Radius** | Keep current radius system |
| **Danger/Success/Warn** | Add `--danger`, `--danger-soft`, `--success`, `--warn` tokens |

## 1. Color Palette — global.css

Replace all `@layer theme { :root { ... } }` tokens:

### Dark (default)

```
--color-background:        #0a0b0d
--color-foreground:        #f4f5f7
--color-card:              #15171b       (--surface)
--color-card-foreground:   #f4f5f7
--color-popover:           #15171b
--color-popover-foreground:#f4f5f7
--color-primary:           #d8fe3d       (accent, electric lime)
--color-primary-foreground:#0a0b0d       (accent-ink)
--color-secondary:         #1d2026       (--surface-2)
--color-secondary-foreground: #f4f5f7
--color-muted:             #1d2026       (--surface-2)
--color-muted-foreground:  #6c6f78       (--text-3)
--color-accent:            #15171b
--color-accent-foreground: #f4f5f7
--color-destructive:       #ff5868       (--danger)
--color-border:            rgba(255,255,255,0.07)
--color-input:             rgba(255,255,255,0.15)  (--surface-2 equiv)
--color-ring:              #d8fe3d
--color-chart-1 through 5: Keep as-is (or neutral)
--color-sidebar-*:         Match card/muted equivalents
```

### Light variant

```
--color-background:        #f6f6f3
--color-foreground:        #0a0b0d
--color-card:              #ffffff
--color-card-foreground:   #0a0b0d
--color-popover:           #ffffff
--color-popover-foreground:#0a0b0d
--color-primary:           #d8fe3d
--color-primary-foreground:#0a0b0d
--color-secondary:         #f3f3f0
--color-secondary-foreground: #0a0b0d
--color-muted:             #f3f3f0
--color-muted-foreground:  #8b8e96
--color-accent:            #f3f3f0
--color-accent-foreground: #0a0b0d
--color-destructive:       #ff5868
--color-border:            rgba(0,0,0,0.07)
--color-input:             rgba(0,0,0,0.10)
--color-ring:              #d8fe3d
--color-sidebar-*:         Match card/muted equivalents
```

## 2. Accent Colors — lib/accent-colors.ts

Replace the 9-color array with 5 sporty colors:

```ts
export const ACCENT_COLORS: AccentColor[] = [
  {
    name: 'Electric Lime',
    key: 'lime',
    swatchHex: '#d8fe3d',
    light: { primary: '#d8fe3d', primaryHex: '#d8fe3d', ring: '#b8d820' },
    dark:  { primary: '#d8fe3d', primaryHex: '#d8fe3d', ring: '#b8d820' },
  },
  {
    name: 'Alarm Red',
    key: 'red',
    swatchHex: '#ff5868',
    light: { primary: '#ff5868', primaryHex: '#ff5868', ring: '#e04050' },
    dark:  { primary: '#ff5868', primaryHex: '#ff5868', ring: '#e04050' },
  },
  {
    name: 'Electric Blue',
    key: 'blue',
    swatchHex: '#5ec3ff',
    light: { primary: '#5ec3ff', primaryHex: '#5ec3ff', ring: '#3ea0e0' },
    dark:  { primary: '#5ec3ff', primaryHex: '#5ec3ff', ring: '#3ea0e0' },
  },
  {
    name: 'Dynamo Orange',
    key: 'orange',
    swatchHex: '#ff8a3d',
    light: { primary: '#ff8a3d', primaryHex: '#ff8a3d', ring: '#e07020' },
    dark:  { primary: '#ff8a3d', primaryHex: '#ff8a3d', ring: '#e07020' },
  },
  {
    name: 'Ultra Violet',
    key: 'violet',
    swatchHex: '#c476ff',
    light: { primary: '#c476ff', primaryHex: '#c476ff', ring: '#a050e0' },
    dark:  { primary: '#c476ff', primaryHex: '#c476ff', ring: '#a050e0' },
  },
];
```

Default accent becomes `lime` (was `neutral`). The accent colors use the same hex in both light/dark since these are vibrant colors that work on both backgrounds.

`applyAccentColor` should also update `--color-primary-foreground` — compute whether the accent is light or dark and set foreground to `#0a0b0d` (dark ink) or `#fff` (light ink) accordingly. For Electric Lime, it's light → dark ink. For Alarm Red, it's dark-ish → white ink.

## 3. Settings — Accent Picker

Update `AccentRow` in `app/(tabs)/settings.tsx` to show 5 swatch circles instead of 9. Default selected accent changes from `neutral` to `lime`.

Update `_layout.tsx` AccentLoader — default accent from `neutral` to `lime`.

## 4. Database Defaults

Default `accent_color` setting changes from `neutral` to `lime`.

## 5. Shadow Tokens

No separate CSS needed — shadows are not expressible as Tailwind tokens in Uniwind. Use inline styles or className utilities as needed.

## Files Changed

| File | Change |
|---|---|
| `global.css` | Replace all `--color-*` theme tokens for light and dark variants |
| `lib/accent-colors.ts` | Replace 9-color array with 5-color array; update defaults; add `primaryForegroundHex` |
| `app/(tabs)/settings.tsx` | Update AccentRow to show 5 colors |
| `app/_layout.tsx` | Change default accent from `neutral` to `lime` |

## Acceptance Criteria

- [ ] Dark theme uses sporty `#0a0b0d` background palette
- [ ] Light theme uses `#f6f6f3` background palette
- [ ] Primary accent is electric lime (`#d8fe3d`) by default
- [ ] Settings shows 5 accent color dots (Lime, Red, Blue, Orange, Violet)
- [ ] Switching accent updates tab bar and all primary-colored elements
- [ ] Danger color is alarm red (`#ff5868`)
- [ ] All existing screens render correctly with new tokens
