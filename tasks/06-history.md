# Phase 6: History Tab

**Status:** pending

## Goal
Calendar view of past workouts plus side-by-side weekly summaries.

## Dependencies
- Phase 1 (Navigation Shell)
- Phase 2 (Database)
- Phase 5 (Workout Tab) — needs workout data to display

## Acceptance Criteria
- [ ] Calendar view showing dates with logged workouts
- [ ] Tap a date → see that day's exercises and sets
- [ ] Weekly summary: body parts worked, total exercises, average weight/reps
- [ ] Empty state when no workouts logged

## Technical Notes
- Reads from workout_logs and routines tables
- Aggregate queries for weekly summaries
