# Task 3 — Workout & PR data logic

**Order:** 3 of 6
**Theme:** Database correctness around personal records and the set editor's dirty check.
Folds earlier finding 2.6 (PR badge persistence — addressed on branch, needs semantic
confirmation) and 3.7 (`isDirty`).

> Workflow (`AGENTS.md`): one sub-task at a time → `requesting-code-review` →
> `receiving-code-review` → commit.

## Sub-tasks

- [ ] **3a. `getExercisePRForDate` semantics + CAST** (`lib/database.ts`) — currently the PR
  chip shows only when the all-time-max weight's *first* `date_logged` equals `date` (ties to
  a past date show nothing). Confirm this is the intended product rule, document it on the
  function, and make `CAST` consistent between the outer `MAX(CAST(weight AS REAL))` and the
  inner `MAX(weight)` subquery. This also resolves earlier finding **2.6** (PR badge lost on
  re-entry) — verify the chip now persists when reopening an already-done exercise.
- [ ] **3b. Remove dead `getExercisePRHistory`** (`lib/database.ts`) — superseded by
  `getExercisePRForDate`. Confirm no callers, then delete.
- [ ] **3c. Cheaper `isDirty`** (`app/(tabs)/workout/[tab]/[id].tsx`) — replace the
  double `JSON.stringify(setValues) !== JSON.stringify(initialSetValues)` with a shallow
  numeric comparator (length check, then per-index `weight`/`reps`). (earlier 3.7)

## Verification
- `npx tsc --noEmit`.
- Manual: log a set that's a PR, navigate away and back → chip persists; log a non-PR set →
  no chip; edit then revert values → save button reflects dirty state correctly.
