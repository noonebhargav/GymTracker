# Task 1 — Pill restyle + Routine layout rework

**Status:** done
**New deps:** none · **Risk:** low · **Do first.**

## Why
The Routine tab feels top-heavy and its tap targets are small (36px, below the 44px guideline). Workout filter pills share the same component, so we fix both at once.

## Scope
**1a. Enlarge the shared pill** — `components/ui/tabs.tsx:54`. Bump the `pill` shape from `h-9 px-4` to ~`h-11 px-5` (≈44px). Keep `rounded-full`. This auto-enlarges both Routine day pills (`app/(tabs)/routine.tsx:114-135`) and Workout filter pills (`components/workout-screen.tsx`).

**1b. Rework Routine body-part picker** — `app/(tabs)/routine.tsx:146-187`. Replace the `flex-row flex-wrap` of `w-1/2 p-2` half-width chips (inner `h-9` pill) with **larger 2-col grid cards** (e.g. `h-14`/`h-16`, `rounded-2xl`) showing the group name with the existing 3-state styling:
- selected → `bg-primary` + `text-primary-foreground`
- covered → `bg-primary/15` + `text-primary` + Check icon (optionally show assigned-day hint from `partToDays`)
- unassigned → `bg-secondary` + `text-muted-foreground`

Keep `toggleBodyPart`, `getChipState`, and accessibility props (`accessibilityRole="switch"`, `accessibilityState`).

**1c.** Verify Workout filter pills still align after the height change, including the carryover dot (`absolute top-1 right-1` in `components/workout-screen.tsx`).

## Files
- `components/ui/tabs.tsx`
- `app/(tabs)/routine.tsx`
- sanity-check `components/workout-screen.tsx`

## Verify
- `npx tsc --noEmit`
- Run app: bigger pills on Routine + Workout; Routine cards toggle and persist across day switches and app restart; a11y roles intact.

## Implementation (high-level flow)
Final design diverged from the original spec after a design pass — see notes below.

1. **Shared pill enlarged** (`components/ui/tabs.tsx`): `pill` shape `h-9 px-4` → `h-11 px-5` (≈44px). One-line change; auto-applies to both Routine day pills and Workout filter pills.
2. **Routine day selector → 4+3 wrap** (`routine.tsx`): replaced the horizontal `ScrollView` with a wrapping, centered `TabsList` (`w-full flex-wrap justify-center`). Day pills get `basis-[22%] grow-0 shrink-0` so exactly 4 fit per row (rigid on web too) → renders **4 on top, 3 centered below**, keeping the whole week visible (no hidden days behind a scroll). Marked-day tint + a11y labels preserved.
3. **Body-part picker → list rows** (`routine.tsx`): replaced the half-width pill grid with a single rounded container (`rounded-2xl border border-border overflow-hidden`) of 8 full-width `h-14` rows with hairline dividers. Per-row state:
   - `selected` → `bg-primary/10`, `text-primary`, trailing `Check` icon.
   - `covered` → neutral row + muted day-hint on the right (e.g. `Mon · Wed`), derived from `partToDays` minus the current day.
   - `unassigned` → neutral row, `text-muted-foreground`, no trailing content.
   `toggleBodyPart`, `getChipState`, Haptics, `accessibilityRole="switch"` + `accessibilityState` all retained.
4. **Workout filter pills**: verified only — carryover dot (`absolute top-1 right-1`) and scroll alignment hold on the taller pill; no code change.

**Design changes vs. original spec:** spec proposed a *2-col grid of larger cards*; after a design discussion this became *single-column list rows* (better fixes the top-heavy feel + has room for day hints). Also added the day-selector 4+3 wrap (not in the original spec) to keep the full week visible once pills grew.

**Verification:** `npx tsc --noEmit` passes clean. Visual run still recommended to confirm the 4+3 split and row toggling on-device.

### Polish (post-review)
- **Day label restyle + reorder** (`routine.tsx`): replaced the large title-case `text-lg` heading (which sat *after* the pills, inside the content) with a small uppercase muted label *above* the pills — `text-[13px] font-semibold text-muted-foreground uppercase tracking-widest`, matching the Workout screen header (`workout-screen.tsx:293`). The label tracks the **selected** day (`DAYS[Number(selectedDay)].full`), not today.
- **Reversed row dimming** (`routine.tsx`): available (`unassigned`) rows are now bright (`text-foreground`); parts assigned to another day (`covered`) are dimmed (`text-muted-foreground`) with their day hint; the active day's picks (`selected`) stay highlighted (accent + Check). Surfaces what's still available to assign.
