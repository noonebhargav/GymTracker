# Task 6 — Performance & app flow

**Order:** 6 of 6 (last — pre-existing optimizations, no correctness risk)
**Theme:** Carried over from the earlier review (section 3, still open). Not introduced by the
`fb-export` branch, but consolidated here so this is the single source of truth.

> Workflow (`AGENTS.md`): one sub-task at a time → `requesting-code-review` →
> `receiving-code-review` → commit.

## Sub-tasks

- [ ] **6a. Replace `workout/index.tsx` redirect with `initialRouteName`**
  (`app/(tabs)/workout/_layout.tsx`) — the redirect to `/workout/recent` flashes on cold
  start. Set `initialRouteName` and delete `index.tsx`. (earlier 3.1)
- [ ] **6b. Stop refetching 4 queries on every focus** (`components/workout-screen.tsx`) —
  cache per-day; invalidate only when returning from the set editor with a "marked done"
  signal (e.g. a search param). (earlier 3.2)
- [ ] **6c. Lazy-load `getRecentExercises`** (`components/workout-screen.tsx`) — only fetch on
  first selection of the `recent` tab. (earlier 3.3)
- [ ] **6d. Compute catalog counts in SQL** — replace holding all 1,324 rows in JS for counts
  with `SELECT body_part, COUNT(*) ... GROUP BY ...`; load full rows only per active tab.
  Affects `components/workout-screen.tsx` and `app/(tabs)/explore/index.tsx`. (earlier 3.4)
- [ ] **6e. Debounce search** (`components/workout-screen.tsx`) — ~150 ms before filtering to
  avoid full-list rerender per keystroke. (earlier 3.5)
- [ ] **6f. Non-blocking reset** (`app/(tabs)/settings.tsx`) — show the row count up front,
  dismiss the dialog, and run the delete in the background. (earlier 3.6)

## Verification
- `npx tsc --noEmit`.
- Device/sim: no flash entering Workout; switching tabs doesn't re-run all queries; search
  feels responsive; reset doesn't freeze the dialog.
