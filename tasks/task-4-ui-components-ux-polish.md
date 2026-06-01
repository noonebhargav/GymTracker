# Task 4 — UI components & UX polish

**Order:** 4 of 6
**Theme:** Component bugs, convention alignment, and the remaining UX items from the earlier
review (2.7 sticky Done, 2.8 haptics, 3.8 carryover visibility).

> Workflow (`AGENTS.md`): one sub-task at a time → `requesting-code-review` →
> `receiving-code-review` → commit.

## Sub-tasks

- [ ] **4a. Stop ruler-wheel double-snap jitter** (`components/ui/ruler-wheel.tsx`) —
  `onScrollEnd` calls animated `scrollTo` inside `onMomentumScrollEnd` on top of native
  `snapToInterval`, risking jitter / a re-entrant momentum loop (mainly iOS). Snap only on
  `onScrollEndDrag` (no-momentum case) or guard re-entrancy. Verify on device.
- [ ] **4b. Theme tokens for tick/label colors** (`components/ui/ruler-wheel.tsx`) — replace
  raw hex branched on `isDark` (`minorTickColor`/`majorTickColor`/`labelColor`) with
  CSS-variable tokens (`border-border`, `text-muted-foreground`), matching the convention the
  explore/hero cards already use.
- [ ] **4c. Unify segmented controls** (`components/ui/segmented-control.tsx`) — `Segmented`
  (history) and `SegmentedControl` (settings) duplicate layout with different active styles.
  Merge via a variant prop; add `elevation` so the active pill's `shadow-sm` isn't flat on
  Android. (earlier 2.1, partially done — now consolidate)
- [ ] **4d. Sticky "Mark as Done" button** (`app/(tabs)/workout/[tab]/[id].tsx`) — it lives
  inside the ScrollView and scrolls off-screen with 4+ sets. Pin to the bottom with a
  safe-area-aware sticky bar. (earlier 2.7)
- [ ] **4e. Consistent haptics** — Settings toggles / routine chips fire haptics; tab nav and
  Done-badge taps don't. Pick one rule (selection feedback on state change) and apply
  uniformly. (earlier 2.8)
- [ ] **4f. Surface routine carryovers** (`components/workout-screen.tsx`) — when Queue mode
  merges yesterday's unfinished parts into today, add a "Carryover" badge / divider so
  scheduled vs carried-over body parts are distinguishable. (earlier 3.8)

## Verification
- `npx tsc --noEmit`.
- Device/sim (iOS + Android): ruler scroll has no jitter and respects theme; segmented active
  pill renders raised on Android; Done button stays visible with many sets; haptics fire
  consistently; carryover parts are visually marked in Queue mode.
