# Polish Tasks

Refined additions for the (near-complete) GymTracker app. **Do one task at a time** (per AGENTS.md): after each, run `requesting-code-review` → `receiving-code-review` → commit before starting the next.

| # | Task | New deps | Rebuild? | Risk |
|---|------|----------|----------|------|
| 1 | [Pill restyle + Routine layout rework](./01-pill-restyle-routine-layout.md) | none | no | low |
| 2 | [Import / Export JSON](./02-import-export-json.md) | file-system, sharing, document-picker | yes | medium |
| 3 | [Rest timer + session stopwatch](./03-rest-timer-session-stopwatch.md) | notifications | yes | med-high |

## Shared notes
- Dev-client project: Tasks 2 & 3 add native modules → need `npm run ios`/`android` rebuild (Fast Refresh won't pick them up).
- Pills are a **shared component** (`TabsTrigger variant="pill"`, `components/ui/tabs.tsx:52-54`) used by both Routine day pills and Workout filter pills — Task 1 changes both intentionally.
- Settings persist as key/value rows (`getSetting`/`setSetting`, `database.ts:220-241`). Any new setting key must also be added to `resetAllData` (`database.ts:243-274`).
