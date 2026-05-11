# Phase 7: Settings Tab

**Status:** pending

## Goal
App preferences — theme, queue mode, GIF toggle.

## Dependencies
- Phase 1 (Navigation Shell)
- Phase 2 (Database)

## Acceptance Criteria
- [ ] Theme toggle: System / Light / Dark
- [ ] Queue mode toggle: On / Off
- [ ] Disable GIFs toggle: On / Off
- [ ] All settings persist across app restarts
- [ ] Theme changes apply immediately

## Technical Notes
- Uses settings table in SQLite
- Theme changes via Uniwind.setTheme()
- Queue mode affects Workout tab behavior (Phase 5)
