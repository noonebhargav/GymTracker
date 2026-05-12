# Session Notes — GymTracker (Session 1)

## Completed Phases

| Phase | Task | Status |
|---|---|---|
| 01 | Navigation Shell | done (from before) |
| 02 | Database | done |
| 03 | Explore Tab | done |
| 04 | Routine Tab | pending |
| 05 | Workout Tab | pending |
| 06 | History Tab | pending |
| 07 | Settings Tab | pending |

---

## Critical Gotchas & Decisions

### 1. expo-sqlite Web Setup
- **Required:** `config.resolver.assetExts.push('wasm')` in `metro.config.js`
- **Required:** COEP/COOP headers for `SharedArrayBuffer`
- **Note:** `wa-sqlite` was installed as a top-level dep (might not be strictly needed)
- Without this, `expo-sqlite` fails to bundle on web

### 2. SQLiteProvider + React.memo
- `SQLiteProvider` from `expo-sqlite` is wrapped in `React.memo` (line 14 of hooks.js)
- **MUST** place `ThemeProvider` OUTSIDE `SQLiteProvider`, otherwise theme changes are blocked
- Correct order:
  ```tsx
  <ThemeProvider value={NAV_THEME[theme]}>
    <SQLiteProvider databaseName="..." onInit={...}>
      <App />
    </SQLiteProvider>
  </ThemeProvider>
  ```

### 3. Third Attempt at Theme was Correct Approach
- Using `SQLiteProvider` proper initializes database before children render
- Use `useSQLiteContext()` in children instead of manual `openDatabaseAsync()`
- Database functions take `db: SQLiteDatabase` parameter

### 4. Route Structure — File-Based > URL Params
- **NEVER** use `router.setParams` for navigational state — use file-based routes
- **NEVER** use empty strings `''` to clear params — use `undefined` (cast with `as any`)
- File-based routes handle browser back natively via Expo Router
- Current Explore structure:
  ```
  explore/
  ├── _layout.tsx        (Stack, headerShown: false)
  ├── index.tsx          (grid + search)
  └── [filter]/
      ├── index.tsx      (exercise list — auto-detects group vs equipment)
      └── [id].tsx       (exercise detail)
  ```
- Tab sub-routes need a `_layout.tsx` with `<Stack screenOptions={{ headerShown: false }} />` to stay scoped

### 5. capitalizeWords
- Use `/\b\w/g` regex (word boundary) — handles hyphens, braces, etc.
- Do NOT use `split(' ').map(...).join(' ')` — misses boundaries after `(`, `-`, etc.

### 6. Android StatusBar
- `StatusBar` from `expo-status-bar` doesn't work the same as `react-native`'s native `StatusBar`
- Use `react-native`'s `StatusBar` directly with `barStyle` (not `expo-status-bar`'s `style`)
- `barStyle="dark-content"` for light mode, `"light-content"` for dark mode

### 7. Secondary Muscle Chips on Android
- Need explicit `flexDirection: 'row'` + `alignItems: 'center'` for text centering
- Uniwind classes alone aren't reliable on Android for chip layout

### 8. Bottom Nav Bar Sizing
- Increased padding (4→8), icon size (20→24), font (10→12), active indicator (2→3)

### 9. Image/GIF Assets
- **Web:** symlink `public/exercises/` → `assets/exercises/` for `/exercises/images/` and `/exercises/videos/` URLs
- **Native:** auto-generated `lib/asset-map.ts` with 1,316 `require()` entries each for images and GIFs
- Use `lib/exercise-assets.ts` as platform-aware resolver: web = URI, native = require() lookup
- Regenerate with: `node scripts/generate-asset-map.js`

### 10. Exercise Detail Layout
- GIF: `resizeMode="contain"`, no forced dimensions, centered
- Target / Muscle Group / Equipment: `DetailRow` with uppercase label + capitalized value
- Secondary muscles: chips with centered text
- Instructions: numbered list (1. 2. 3.)
- Divider after GIF, divider after secondary muscles (between sections)
- Only show fields that have data

### 11. BackHandler Placement
- `useEffect` with `BackHandler` must be placed AFTER all variables it references are defined
- Otherwise TypeScript throws "used before declaration" errors

### 12. Data Notes
- 1,324 exercises in seed data
- 8 Gold Standard groups: Chest, Back, Shoulders, Biceps, Triceps, Legs, Core/Abs, Cardio
- 28 equipment types
- 40 exercises have version suffixes (v. 2, v. 3)
- Mapping: `upper arms` → Biceps or Triceps based on `target` field
- `lower arms` and `neck` don't map to any gold standard group

---

## Key Files Created/Modified This Session

| File | Purpose |
|---|---|
| `lib/database.ts` | DB schema, init, seed, queries |
| `lib/exercise-groups.ts` | 8 gold standard groups, equipment list, body_part→group mapping |
| `lib/exercise-assets.ts` | Platform-aware image/GIF resolver |
| `lib/asset-map.ts` | Auto-generated 2,640-line require() map (1,316 images + GIFs) |
| `lib/utils.ts` | `capitalizeWords` with `/\b\w/g` regex |
| `scripts/generate-asset-map.js` | Regenerates asset-map.ts from seed data |
| `app/_layout.tsx` | ThemeProvider OUTSIDE SQLiteProvider |
| `app/(tabs)/_layout.tsx` | Drawer popstate handler |
| `app/(tabs)/explore/_layout.tsx` | Stack scoping for explore sub-routes |
| `app/(tabs)/explore/index.tsx` | Grid + search |
| `app/(tabs)/explore/[filter]/index.tsx` | Exercise list (group or equipment) |
| `app/(tabs)/explore/[filter]/[id].tsx` | Exercise detail |
| `components/exercise-detail.tsx` | Detail modal (still used for inline usage) |
| `components/navigation/tab-bar.tsx` | Bigger sizing (padding, icons, font) |
| `metro.config.js` | WASM support + COEP/COOP headers |
| `public/exercises/` | Symlinks for web image/GIF serving |
