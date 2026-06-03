# Task 4 — Insights tab: volume metric + bug fixes (and History consistency)

**Status:** todo
**New deps:** none · **Rebuild?** no (JS-only) · **Risk:** medium

## Why
The Insights tab's "Body parts" heatmap and "Weekly avg weight" chart both key off **average weight per set**, which is dominated by exercise selection (leg/back compounds dwarf biceps/core) rather than training emphasis, and is meaningless for Cardio. Two latent bugs compound this:

1. **Biceps & Triceps tiles are always empty.** The heatmap query selects only `body_part`; the rollup calls `toGoldStandardGroup(row.body_part)` **without** `target` (`insights-tab.tsx:153`). For arms, `body_part = 'upper arms'` and, without `target`, that maps to `null` (`exercise-groups.ts:44-47`) — so every biceps/triceps log is silently dropped.
2. **Average-of-averages rollup.** Each `workout_logs` row is one set, so the SQL `AVG(weight) GROUP BY body_part` is already set-weighted *within* a body part. But the JS rollup averages multiple body parts into one Gold Standard group with **equal weight** — wrong for **Legs** (`upper legs` + `lower legs`) and for the arms split once bug #1 is fixed.

PRs rank by raw `MAX(weight)`, ignoring reps (a 100×1 outranks a 95×10).

**Decision (approved):** heatmap + chart → **training volume** `Σ(weight × reps)`; PRs → **estimated 1RM** (Epley); propagate a Volume stat to Calendar/Summary for consistency.

## Data facts (verified)
- `workout_logs` has **no `target`** column — only `body_part`. `target` lives on `exercises`, so the heatmap query must `JOIN exercises` to split arms.
- Weights stored in **kg**. `displayWeight` snaps to a 2.5 grid — fine for single weights, **wrong for volume sums** → need a linear `displayVolume` + compact formatter.
- `getMonthlyAggregates` / `DayAggregateRow` are **shared** with `summary-tab.tsx` + `calendar-tab.tsx` → only **add** a `volume` column (additive, non-breaking). `getBodyPartAvgWeights` + `getWindowPRs` are Insights-only → free to change.

## Scope

**4a. DB layer — `lib/database.ts`**
- Add helpers:
  - `displayVolume(kg, unit)` → number (linear: `unit === 'kg' ? kg : kg * LBS_FACTOR`, no 2.5 snap).
  - `formatVolume(kg, unit)` → compact string: `>= 1000` → `"12.3k"`, else rounded integer; caller appends unit.
- Add `volume` to `DayAggregateRow` + `getMonthlyAggregates`: `SUM(weight * reps) AS volume`.
- Replace `getBodyPartAvgWeights`/`BodyPartAvgRow` with `getBodyPartVolumes`/`BodyPartVolumeRow { body_part, target, volume, set_count }`:
  ```sql
  SELECT wl.body_part, e.target,
         SUM(wl.weight * wl.reps) AS volume,
         COUNT(*)                 AS set_count
  FROM workout_logs wl
  JOIN exercises e ON wl.exercise_id = e.id
  WHERE wl.date_logged >= ? AND wl.date_logged <= ?
  GROUP BY wl.body_part, e.target
  ```
- Rewrite `getWindowPRs` to rank by Epley `weight * (1 + reps / 30.0)`. `WindowPRRow` → `{ exercise_id, exercise_name, est_1rm, weight, reps, best_date }`. Pick each exercise's best-1RM set in-window via `ROW_NUMBER() OVER (PARTITION BY exercise_id ORDER BY e1rm DESC, date_logged ASC)`, and only surface it when `e1rm >` the pre-window best 1RM (`COALESCE(MAX(weight*(1+reps/30.0)) for date_logged < windowStart, 0)`). Order by `best_date DESC`.

**4b. Insights heatmap — `components/history/insights-tab.tsx`**
- Use `getBodyPartVolumes`; roll up with `toGoldStandardGroup(row.body_part, row.target)`, summing `volume` + `set_count` per group (set-weighted by construction).
- **Intensity** = group volume ÷ max volume across **strength** groups (exclude Cardio from the max).
- **Cardio** (`volume ≈ 0`): excluded from the volume normalization; tile shows **set count** (`"8 sets"`) with a fixed faint tint when `set_count > 0`. *(The one accepted metric compromise — documented here.)*
- Strength tile value: `formatVolume(volume, unit)` + unit; empty groups still show "Rest".
- Add `accessibilityLabel` to each tile (e.g. `"Chest, 12.3k lbs volume"` / `"Biceps, rest"`).

**4c. Insights chart — `insights-tab.tsx`**
- "Weekly avg weight" → **"Weekly volume"**: per-week `Σ volume` from `getMonthlyAggregates`. Same bars, same tap-to-select-week → heatmap window interaction, same +/-% delta. Header shows latest week's volume via `formatVolume`.

**4d. Insights PRs — `insights-tab.tsx`**
- Bold value = est. 1RM via `displayWeight(est_1rm, unit)` (it IS a weight → snapping OK). Subtitle = `"{displayWeight(weight)} {unit} × {reps}"` + `best_date`.

**4e. Empty state — `insights-tab.tsx`**
- When `dailyAggs`, `bodyPartRows`, and `prRows` are all empty, render one centered "No insights yet — log a workout to get started" card instead of three empty cards.

**4f. History consistency (per review of Calendar + Summary)**
- **Calendar** (`calendar-tab.tsx`): add a **VOLUME** cell to the monthly stats row (sum `volume` across `aggregates`, `formatVolume`). Row goes 3 → 4 cells (`flex-1`, matches Summary's 4-wide pattern).
- **Summary** (`summary-tab.tsx`): add a **VOLUME** cell to each week's stat grid (sum `volume` per week). Keep the `w-1/2` grid; the 5th cell wraps to its own half-width row.
- Leave the existing AVG WEIGHT/AVG WGT/AVG REPS cells as-is (different lens, not wrong). Do **not** relabel "WORKOUTS".

## Files
- `lib/database.ts`
- `components/history/insights-tab.tsx`
- `components/history/calendar-tab.tsx`
- `components/history/summary-tab.tsx`

## Verify
- `npx tsc --noEmit`
- Heatmap: log biceps + triceps sets → both tiles populate (no longer "Rest").
- Heatmap: a week with heavy legs + light arms shades by total work, not just weight; Legs reflects combined upper+lower legs set-weighted.
- Cardio tile shows `"N sets"` when cardio logged, not a weight.
- Chart header + bars reflect weekly volume; tapping a bar still re-scopes only the heatmap.
- PRs: a 95×10 set outranks a 100×1 set for the same exercise; subtitle shows actual weight × reps.
- Empty DB / empty month → single empty-state card, no crash.
- Calendar + Summary show a Volume stat consistent with Insights; Summary/Calendar still render correctly (no NaN, layout intact).
