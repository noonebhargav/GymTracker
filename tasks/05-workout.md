# Phase 5: Workout Tab

**Status:** pending

## Goal
Log daily exercises — sets, weight, reps. Auto-detects today's body parts from routine. Queue mode for missed parts.

## Dependencies
- Phase 1 (Navigation Shell)
- Phase 2 (Database)
- Phase 4 (Routine Tab)

## Acceptance Criteria
- [ ] Auto-detects current day's scheduled body parts from routine
- [ ] Horizontal tabs filtered to today's parts: [All] [Chest] ...
- [ ] Tap exercise → enter weight + reps → save set
- [ ] Each set saved to workout_logs table
- [ ] Queue mode: missed body parts carry forward one day (max 1 day)

## Technical Notes
- Reads from routines and workout_logs tables
- Queue logic per body part, not per day
- Duplicate body parts merged on same day
