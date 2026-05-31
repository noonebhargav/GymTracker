# Task 2 — "Today" / rollover correctness

**Order:** 2 of 6
**Theme:** Make every date-dependent surface consistent through the new `useToday` hook.
The `useToday` migration (earlier finding 1.2) is done, but a few surfaces were missed and
two effects now race.

> Workflow (`AGENTS.md`): one sub-task at a time → `requesting-code-review` →
> `receiving-code-review` → commit.

## Sub-tasks

- [ ] **2a. Coordinate `windowEndDate` init** (`app/(tabs)/history/index.tsx`) — two effects
  (rollover `[today]` + snap `[dateRange?.first]`) race on mount and the snap can clobber
  manual prev/next navigation on refocus. Compute the initial window once (lazy initializer /
  `useMemo` from `dateRange` + `today`); guard snap with a `didSnapRef`. Replace the
  non-reactive `todayStr` alias usages (`canGoNextWindow`, `goToNextWindow`) with reactive
  `today`.
- [ ] **2b. Migrate calendar to `useToday`** (`app/(tabs)/history/index.tsx`,
  `components/history/calendar-tab.tsx`) — `currentYear`/`currentMonth`, `canGoNextWindow`,
  and `isToday`/`isFuture` still use raw `new Date()`, so the calendar's "today" highlight and
  next-bound go stale at midnight. Thread `today` through.
- [ ] **2c. Fix queue rollover gap** (`components/workout-screen.tsx`) — the queue effect uses
  non-reactive `yesterdayDateStr()` with deps `[db, loaded, queueEnabled]`. Add `today` to
  deps and derive yesterday from it so carryover updates on rollover.

## Verification
- `npx tsc --noEmit`.
- Device/sim: page history windows then refocus → window doesn't jump (2a); simulate a
  date change → calendar "today" + workout queue update without remount (2b/2c).
