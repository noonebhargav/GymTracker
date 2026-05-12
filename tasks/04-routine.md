# Phase 4: Routine Tab

**Status:** done

## Goal
Configure which body parts go on each day (Mon–Sun). Reads and writes to SQLite.

## Dependencies
- Phase 1 (Navigation Shell)
- Phase 2 (Database)

## Acceptance Criteria
- [x] Monday through Sunday layout with body part selectors per day
- [x] Can select multiple body parts per day
- [x] Selection persists across app restarts
- [x] Clear visual for which parts are assigned to which day

## Technical Notes
- Uses routines table in SQLite
- 8 gold standard body parts
- Horizontal scrollable day circles (Mon–Sun) with expand panel
- Reanimated `FadeInDown`/`FadeOutUp` for panel transitions
- Three chip states: selected (solid primary), covered-elsewhere (accent tint + Check icon), unassigned (muted)
- Haptic feedback on chip toggle (expo-haptics)
- Optimistic UI with DB persistence, revert on failure

## Implementation
- `lib/database.ts`: `getAllRoutines()`, `setRoutineDay()` (transaction-based)
- `app/(tabs)/routine.tsx`: Full screen with day selector + body part chip grid
