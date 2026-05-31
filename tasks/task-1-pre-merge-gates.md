# Task 1 — Pre-merge gates

**Order:** 1 of 6 (do first — blocks the rest)
**Theme:** Build / tooling safety introduced by the SDK upgrade on `fb-export`.

> Workflow (`AGENTS.md`): one sub-task at a time → `requesting-code-review` →
> `receiving-code-review` → commit.

## Sub-tasks

- [ ] **1a. Typecheck the TS 6.0 bump** — `package.json` raised `typescript` `~5.9.2 → ~6.0.3`
  (major). Run `npx tsc --noEmit` and fix fallout, especially the hand-rolled conditional
  `BottomTabBarProps` types in `app/(tabs)/_layout.tsx` and `components/navigation/tab-bar.tsx`.
- [ ] **1b. Validate `expo-status-bar` config plugin** — `app.json` adds `expo-status-bar`
  (and `expo-splash-screen`) to `plugins`, but `expo-status-bar` historically ships no config
  plugin. Run `npx expo-doctor` / a prebuild check; if invalid, remove it from `plugins`
  (keep the dependency — it's a runtime component).

## Verification
- `npx tsc --noEmit` passes clean.
- `npx expo-doctor` reports no plugin errors.
