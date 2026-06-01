# Task 5 — Theming & shared-helper cleanup

**Order:** 5 of 6
**Theme:** Low-risk consistency refactors and doc fixes, batched together.

> Workflow (`AGENTS.md`): one sub-task at a time → `requesting-code-review` →
> `receiving-code-review` → commit.

## Sub-tasks

- [ ] **5a. `useThemeColors()` hook** (`lib/theme.ts`) — extract the duplicated
  `isDark ? THEME.dark.* : THEME.light.*` block used in `app/_layout.tsx` and
  `app/(tabs)/_layout.tsx`; reuse it in both. Drop the unnecessary `as any` on `headerStyle`
  (its keys are valid `ViewStyle`).
- [ ] **5b. Centralize duplicated helpers** — one `mapJsDayToOur` (`(jsDay+6)%7`, currently in
  ≥3 files) and a shared `formatLocalDate(d)` (re-implemented inside `getWorkoutStreak`),
  e.g. exported from `lib/use-today.ts`. Reuse everywhere.
- [ ] **5c. Tighten `lib/theme.ts` type** — replace `type Theme = typeof DarkTheme` with the
  proper imported `Theme` type from `expo-router`.
- [ ] **5d. Keyed accent fallback** (`app/_layout.tsx`) — replace positional
  `LIME = ACCENT_COLORS[0]` with a keyed lookup or an exported `DEFAULT_ACCENT` from
  `lib/accent-colors.ts`.
- [ ] **5e. Update docs** (`AGENTS.md`) — Tech Stack still says "Expo SDK 55 / expo-sqlite
  v55"; actual is **SDK 56** (the commit message "66" is a typo). Correct the table.

## Verification
- `npx tsc --noEmit`.
- Smoke-test light/dark switch and accent reset still behave correctly after the refactors.
