# Phase 5: Workout Tab

**Status:** done

## Goal
Log daily exercises — sets, weight, reps. Auto-detects today's body parts from routine. Queue mode for missed parts.

## Dependencies
- Phase 1 (Navigation Shell)
- Phase 2 (Database)
- Phase 4 (Routine Tab)

## Acceptance Criteria
- [x] Auto-detects current day's scheduled body parts from routine
- [x] Horizontal filter tabs: [Recent] [Chest] [Back] ... [All]
- [x] Tap exercise → full-screen set editor screen
- [x] Set editor: weight/reps with fast/slow steppers + direct input
- [x] Each set saved to workout_logs table
- [x] Queue mode: missed body parts carry forward one day (max 1 day)
- [x] Routine changes reflected on tab switch (useFocusEffect refresh)
- [x] Exercise info card links to modal detail screen (GIF + instructions)
- [x] Collapsible set UI moved to subroute for performance
- [x] Remove set button on each row (MinusCircle, min 1 set)

## Architecture Notes
- **Inline editing moved to subroute**: `/workout/{tab}/{exercise-id}` via Stack navigator
- **Exercise detail**: `/exercise-detail/{id}` modal on root Stack — back gesture returns to set editor
- **Tab bar**: Custom TabBar in `components/navigation/tab-bar.tsx` — `!isFocused` guard preserved
- **Performance**: Removed `JSON.stringify` dirty check, Reanimated CollapsibleContent, expandedExercise state from FlatList
- **Refresh**: `useFocusEffect` reloads `routines` + `completedToday` on tab switch
