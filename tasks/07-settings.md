# Phase 7: Settings Tab

**Status:** done

## Goal
App preferences — theme, queue mode, GIF toggle.

## Dependencies
- Phase 1 (Navigation Shell)
- Phase 2 (Database)

## Acceptance Criteria
- [x] Theme toggle: System / Light / Dark
- [x] Queue mode toggle: On / Off
- [x] Disable GIFs toggle: On / Off
- [x] All settings persist across app restarts
- [x] Theme changes apply immediately
- [x] Accent color picker (9 colors)
- [x] Settings sections reordered (General → Defaults → Appearance)

## Technical Notes
- Uses settings table in SQLite
- Theme changes via Uniwind.setTheme()
- Accent colors via Uniwind.updateCSSVariables()
- Shared accent store for instant tab bar updates
- Queue mode affects Workout tab behavior (Phase 5)

## Redesign Follow-up

See [Phase 15: Settings Tab Restructure](./15-settings.md) for redesign changes:
- Add About section with Export workout data row
- Replace weight/reps steppers with RulerWheel picker
- Restyle reset button (danger-soft bg, no AlertDialog)
