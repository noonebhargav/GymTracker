# Phase 6: History Tab

**Status:** done

## Goal
Calendar view of past workouts plus side-by-side weekly summaries.

## Dependencies
- Phase 1 (Navigation Shell)
- Phase 2 (Database)
- Phase 5 (Workout Tab) — needs workout data to display

## Acceptance Criteria
- [x] Calendar view showing dates with logged workouts
- [x] Tap a date → see that day's exercises and sets
- [x] Weekly summary: body parts worked, total exercises, average weight/reps
- [x] Empty state when no workouts logged

## Technical Notes
- Reads from workout_logs and routines tables
- Aggregate queries for weekly summaries
