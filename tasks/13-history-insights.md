# Phase 13: History Tab — Insights (Avg Weight Chart, Heatmap, PRs)

**Status:** pending

## Goal

Add a third "Insights" sub-tab to History with an average weight chart, body part average weight heatmap, and recent PRs list. Also enhance Calendar and Summary views per the design prototype.

## Dependencies

- Phase 8 (Visual Design System)
- Phase 5 (Workout Tab — needs data to compute insights)
- Phase 6 (Existing History Tab)

## Decisions

| Aspect | Decision |
|---|---|
| Chart type | **Avg weight** per week (not volume) — 12-week bar chart |
| Heatmap metric | **Avg weight** by body part (not volume) — last 7 days |
| Value display | Show rounded avg weight + unit (e.g. "135 lbs") |
| PRs | Recent PRs this month from workout_logs |

## 1. Sub-tab Navigation

Add "Insights" as third option in the segmented control alongside "Calendar" and "Summary":

```tsx
<Seg value={tab} onChange={setTab} options={[
  { value: 'calendar', label: 'Calendar' },
  { value: 'summary', label: 'Summary' },
  { value: 'insights', label: 'Insights' },
]} />
```

## 2. Avg Weight Chart (12-week)

**Data query**: For each of the last 12 weeks, compute:
```sql
SELECT AVG(weight) as avg_weight
FROM workout_logs
WHERE date_logged BETWEEN week_start AND week_end
```

**Visual**:
- Horizontal bar chart, 140px tall
- Each bar height proportional to avg weight (relative to max)
- Bars: `bg-secondary` (inactive), `bg-primary` with glow for current week
- X-axis labels: "W1", "W7", "W12" at milestones
- Header: "Weekly avg weight" + current week value (e.g. "145 lbs")
- Delta pill: percentage change vs previous week (accent-soft bg if positive, danger-soft if negative)

## 3. Body Part Avg Weight Heatmap

**Data query**: For last 7 days, per body part:
```sql
SELECT body_part, AVG(weight) as avg_weight
FROM workout_logs
WHERE date_logged >= date('now', '-7 days')
GROUP BY body_part
```

**Visual**:
- 4-column grid, 8 cells
- Each cell: body part name + avg weight (or "rest" if zero)
- Cell background tinted with body part's color at opacity proportional to avg weight relative to max
- Legend bar below: "Less" ← gradient → "More"

**Note**: Since body part tints were skipped earlier, use accent color for the heatmap tinting instead. All cells shade from accent-soft to accent, proportional to value.

## 4. Recent PRs

**Data query**: Find max weight per exercise this month that exceeds previous max:
```sql
SELECT exercise_id, MAX(weight) as max_weight, date_logged
FROM workout_logs
WHERE date_logged >= date('now', 'start of month')
GROUP BY exercise_id
-- Then compare against all-time max excluding this month
```

**Visual**:
- List of cards with: trophy icon (accent-soft bg), exercise name, date (short), best weight
- Separator between items
- "This month" label in header

## 5. Calendar Enhancements

Per the design:
- Larger workout dot indicators (size varies by exercise count: 8px for 1, 14px for 3+)
- Today cell: inverted colors (foreground bg, background text)
- Legend below calendar: dot size legend
- Monthly stats below calendar: Workouts / Sets / Volume summary tiles

## 6. Weekly Summary Enhancements

Per the design:
- Dashed border for weeks with no data
- Body part pills (colored dot + name) for weeks with data
- 4-cell stat grid: WORKOUTS, SETS, AVG WEIGHT, AVG REPS (large numbers, small label)
- Week range formatted as "WEEK OF MAY 18 – MAY 24"

## Files Changed

| File | Change |
|---|---|
| `app/(tabs)/history/index.tsx` | Add Insights sub-tab; avg weight chart; heatmap; PRs; calendar/Summary enhancements |
| `app/(tabs)/history/[date].tsx` | Minor: restyle day detail cards |
| `lib/database.ts` | Add avg weight queries (weekly, by body part, PRs) |

## Acceptance Criteria

- [ ] History has 3 sub-tabs: Calendar, Summary, Insights
- [ ] Avg weight chart shows 12 weeks of bars, current week highlighted
- [ ] Delta percentage pill shows week-over-week change
- [ ] Body part heatmap shows avg weight per body part with accent tinting
- [ ] Heatmap shows "rest" for body parts with no data in last 7 days
- [ ] Recent PRs list shows personal records from this month
- [ ] Calendar dots vary in size based on exercise count
- [ ] Weekly summaries use 4-cell stat grid format
- [ ] Empty weeks show dashed border
