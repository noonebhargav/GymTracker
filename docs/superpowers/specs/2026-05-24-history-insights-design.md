# History Tab — Insights Design

**Date:** 2026-05-24  
**Status:** Approved

## Overview

Add a third "Insights" sub-tab to the History screen alongside Calendar and Summary. Refactor the three tab views into separate components. Add a 10-week avg weight bar chart, body part heatmap, and recent PRs list to Insights. Enhance the Calendar dot sizes and monthly stats row. Enhance the Summary week card with a 4-cell stat grid.

---

## File Structure

```
app/(tabs)/history/index.tsx             ← orchestrator: segmented control, navigators, tab rendering
components/history/calendar-tab.tsx      ← existing calendar + enhancements (extracted)
components/history/summary-tab.tsx       ← existing summary + enhancements (extracted)
components/history/insights-tab.tsx      ← new: chart, heatmap, PRs
lib/database.ts                          ← add getBodyPartAvgWeights, getWindowPRs
```

`index.tsx` becomes a thin orchestrator. Each tab component fetches its own data.

---

## Section 1 — index.tsx (Orchestrator)

- Holds `mode: 'calendar' | 'summary' | 'insights'` state
- Holds `currentYear`, `currentMonth` for Calendar and Summary
- Holds `windowEndDate: string` for Insights (ISO date string of the last day of the active 10-week window; defaults to today)
- Holds `weightUnit: 'lbs' | 'kg'` (loaded once from settings, passed to all tabs)
- Renders the segmented control (3 options: Calendar, Summary, Insights)
- Renders the **month navigator** (prev/next month arrows + month label) only when `mode !== 'insights'`
- Renders the **window navigator** (prev/next 10-week arrows + date range label) only when `mode === 'insights'`
- Window navigator label format: `APR 7 – JUN 15` (start and end of 10-week window)
- Next arrow is disabled when `windowEndDate` is at or after today

---

## Section 2 — Insights Tab (`components/history/insights-tab.tsx`)

Receives props: `windowEndDate: string`, `weightUnit: 'lbs' | 'kg'`

Derives `windowStartDate` as 70 days before `windowEndDate` (10 weeks × 7 days).

Fetches on mount and when `windowEndDate` changes (via `useEffect`):
- `getMonthlyAggregates(db, windowStartDate, windowEndDate)` — for the chart
- `getBodyPartAvgWeights(db, windowEndDate - 6 days, windowEndDate)` — for the heatmap (last 7 days of window)
- `getWindowPRs(db, windowStartDate, windowEndDate)` — for the PRs list

### 2a — 10-Week Avg Weight Chart

- Vertical bar chart, 140px tall container
- 10 columns, one per week (grouped from daily `getMonthlyAggregates` rows using `getMondayOfWeek`)
- Bar height proportional to week's avg weight relative to the window max
- Empty week (no data): 4px stub bar
- Last week in window: `bg-primary` bar
- All other weeks: `bg-secondary` bar
- X-axis labels below: "W1" at first, "W5" at midpoint, "W10" at last
- Header: "Weekly avg weight" label left-aligned + current window-end week value right-aligned (e.g. "145 lbs")
- Delta pill: % change vs the previous week — green (`bg-accent/20 text-accent`) if positive, red (`bg-destructive/20 text-destructive`) if negative, hidden if previous week has no data

### 2b — Body Part Heatmap

- 4×2 grid, 8 cells — one per Gold Standard group: Chest, Back, Shoulders, Biceps, Triceps, Legs, Core/Abs, Cardio
- Raw `body_part` values from DB mapped to Gold Standard group via `toGoldStandardGroup`
- Multiple raw body parts can map to the same group — average their weights together
- Cell: group name (small, muted) + avg weight value or "Rest" if zero
- Cell background: `bg-secondary` at zero, `bg-primary/60` at max — linearly interpolated by `(cellAvg / maxAvg)`
- Legend strip below grid: "Less" — gradient bar — "More"
- Header: "Body parts" label + "Last 7 days" subtitle

### 2c — Recent PRs

- Header: "Personal Records" label + window date range as subtitle
- Detect via `getWindowPRs`: exercise's max weight in window exceeds all-time max before window start
- Each PR row: trophy icon with `bg-primary/10` background, exercise name, best date (short format e.g. "May 18"), weight value
- Separator between rows
- Empty state: "No PRs this period" in muted text
- List is not paginated — show all PRs for the window

---

## Section 3 — Calendar Tab (`components/history/calendar-tab.tsx`)

Receives props: `year`, `month`, `weightUnit`.

Fetches `getMonthlyAggregates(db, monthStart, monthEnd)` internally on mount and when `year`/`month` props change, and on screen focus via `useFocusEffect`. Uses the daily `exercise_count` and aggregate totals for dot sizing and the stats row.

### Workout dot size by exercise count

Replace the fixed `size-1.5` dot with a size that varies:
- 1 exercise: 6px
- 2 exercises: 8px
- 3+ exercises: 10px

Uses the `exercise_count` from `getMonthlyAggregates` (already available).

### Monthly stats row

Three tiles rendered below the calendar grid (inside the ScrollView):

```
┌──────────┬──────────┬──────────────┐
│    12    │   48     │   145 lbs    │
│ WORKOUTS │  SETS    │  AVG WEIGHT  │
└──────────┴──────────┴──────────────┘
```

Values summed/averaged across the visible month from `aggregates`. Uses `bg-card border border-border` card styling. Hidden if month has no data.

---

## Section 4 — Summary Tab (`components/history/summary-tab.tsx`)

Receives same props as current Summary view.

### 4-cell stat grid (weeks with data)

Replace the two `<Text>` stat lines with a 2×2 grid:

```
┌──────────┬──────────┐
│    3     │   12     │
│ WORKOUTS │  SETS    │
├──────────┼──────────┤
│  145 lbs │   10     │
│ AVG WGT  │ AVG REPS │
└──────────┴──────────┘
```

Large number (`text-xl font-bold`) on top, small uppercase label (`text-[10px] text-muted-foreground tracking-widest`) below. `flex-row flex-wrap` with each cell taking 50% width.

No changes to: dashed border for empty weeks, body part pills, week range format — all already correct.

---

## Section 5 — New DB Queries

### `getBodyPartAvgWeights(db, startDate, endDate)`

```sql
SELECT body_part, AVG(weight) as avg_weight
FROM workout_logs
WHERE date_logged >= ? AND date_logged <= ?
GROUP BY body_part
```

Returns `{ body_part: string; avg_weight: number }[]`.

### `getWindowPRs(db, windowStart, windowEnd)`

```sql
SELECT wl.exercise_id, e.name AS exercise_name,
  MAX(wl.weight) AS max_weight, wl.date_logged AS best_date
FROM workout_logs wl
JOIN exercises e ON wl.exercise_id = e.id
WHERE wl.date_logged >= ? AND wl.date_logged <= ?
  AND wl.weight > COALESCE((
    SELECT MAX(weight) FROM workout_logs
    WHERE exercise_id = wl.exercise_id AND date_logged < ?
  ), 0)
GROUP BY wl.exercise_id
ORDER BY wl.date_logged DESC
```

Returns `{ exercise_id: string; exercise_name: string; max_weight: number; best_date: string }[]`.

The 10-week chart reuses the existing `getMonthlyAggregates` called with the window date range — no new query needed.

---

## Acceptance Criteria

- [ ] History has 3 sub-tabs: Calendar, Summary, Insights
- [ ] Month navigator hidden on Insights; window navigator shown instead
- [ ] Insights: 10-week avg weight chart with W1/W5/W10 labels and delta pill
- [ ] Insights: body part heatmap with 8 Gold Standard groups, accent-tinted by avg weight
- [ ] Insights: heatmap shows "Rest" for groups with no data in last 7 days of window
- [ ] Insights: PR list shows exercises where window max > all-time prior max
- [ ] Insights: empty PR state handled gracefully
- [ ] Insights: prev/next window shifts by 10 weeks; next disabled at current week
- [ ] Calendar: workout dot size varies (6/8/10px) by exercise count
- [ ] Calendar: monthly stats row (Workouts, Sets, Avg Weight) below grid
- [ ] Summary: week cards with data show 4-cell stat grid
- [ ] All three tabs extracted to separate component files
