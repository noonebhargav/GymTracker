# Phase 2: Database

**Status:** done

## Goal
Create SQLite tables and seed exercises from lib/seed_data.json. Display exercise count in the Explore tab to confirm it works.

## Dependencies
- Phase 1 (Navigation Shell) — Explore tab must exist

## Acceptance Criteria
- [x] SQLite tables created: exercises, routines, workout_logs, settings
- [x] 1,324 exercises seeded from seed_data.json
- [x] Explore tab shows "1,324 exercises loaded"
- [x] App relaunch does not re-seed

## Technical Notes
- Use `expo-sqlite`
- Schema design needed before implementation
