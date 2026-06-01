# AGENTS.md

## Project Overview

**GymTracker** — a simple, fast gym workout tracker for managing weekly routines and logging exercises. Built with Expo, React Native Reusables, and SQLite. Runs on iOS, Android, and Web.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Expo SDK 56, Expo Router v56 (file-based routing) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 via **Uniwind** |
| Component Library | **React Native Reusables** (shadcn/ui-style, built on `@rn-primitives`) |
| Database | `expo-sqlite` v56 |
| Icons | `lucide-react-native` |
| Animation | `react-native-reanimated` v4, `tw-animate-css` |
| Keyboard | `react-native-keyboard-controller` |
| Gestures | `react-native-gesture-handler` |

## Directory Structure

```
app/
  _layout.tsx                       # Root layout — Stack navigator, ThemeProvider, SystemUI
  index.tsx                         # Entry screen
  +html.tsx                         # Web COEP/COOP headers
  +not-found.tsx                    # 404
  exercise-detail/[id].tsx          # Root-level modal: GIF + instructions
  (tabs)/
    _layout.tsx                     # Tab bar (custom TabBar component)
    routine.tsx                     # Routine tab: day selector + body-part chips
    settings.tsx                    # Settings tab
    explore/
      _layout.tsx
      index.tsx                     # Search + Body Parts / Equipment sections
      [filter]/index.tsx            # Category list (body part or equipment)
      [filter]/[id].tsx             # Single exercise detail (within explore stack)
    history/
      _layout.tsx
      index.tsx                     # Calendar / Summary / Insights tab switcher
      [date].tsx                    # Day detail: logged exercises for a date
    workout/
      _layout.tsx
      index.tsx                     # Today's workout (redirects to [tab])
      [tab].tsx                     # Exercise list for a body-part tab
      [tab]/[id].tsx                # Set editor: weight, reps, sets

components/
  navigation/tab-bar.tsx            # Custom bottom tab bar
  exercise-detail.tsx               # Exercise info card (GIF, target, equipment)
  exercise-row.tsx                  # List row for a single exercise
  workout-screen.tsx                # Shared workout screen (tabs + search + list)
  history/
    calendar-tab.tsx                # Monthly calendar view
    summary-tab.tsx                 # Weekly summary: body parts, sets, avg weight
    insights-tab.tsx                # 10-week chart, body-part heatmap, PRs
  ui/
    alert-dialog.tsx                # Modal confirmation dialog
    button.tsx                      # CVA button variants
    icon.tsx                        # Lucide icon wrapper
    ruler-wheel.tsx                 # Horizontal scroll ruler picker
    segmented-control.tsx           # Segmented toggle row
    switch.tsx                      # Toggle switch
    text.tsx                        # Themed text component

lib/
  database.ts                       # All SQLite queries + schema init + seed
  accent-colors.ts                  # Accent color definitions + CSS variable injection
  accent-store.ts                   # Zustand-like accent color global state
  asset-map.ts                      # exercise id → image/GIF asset require() map
  exercise-assets.ts                # Helpers for resolving exercise image/video URIs
  exercise-groups.ts                # Gold Standard groups + equipment consolidation
  seedData.json                     # 1,324 exercises (body_part, target, equipment, images)
  theme.ts                          # Navigation theme (light/dark)
  use-responsive.ts                 # Screen-size breakpoint hook
  utils.ts                          # cn(), capitalizeWords()

assets/
  exercises/
    images/                         # 1,316 exercise illustration JPGs
    videos/                         # Exercise animation GIFs

global.css                          # Tailwind CSS v4 variables (light/dark theme)
app.json                            # Expo config (typedRoutes, scheme, plugins)
dataset.md                          # Exercise taxonomy reference
```

## Commands

```bash
npm run dev          # Start Expo dev server
npm run android      # Android only
npm run ios          # iOS only (Mac)
npm run web          # Web only
```

No lint/typecheck scripts are defined. Use:
```bash
npx tsc --noEmit    # Type-check the project
```

## Conventions

### Styling
- Use `className` with Tailwind utilities (Uniwind). No StyleSheet.
- Import `cn` from `@/lib/utils` for conditional classes.
- Theme colors are CSS variables in `global.css`. Use them as Tailwind classes (e.g., `bg-primary text-primary-foreground`).

### Components
- UI primitives live in `components/ui/`. Follow the existing pattern (CVA variants, forward refs).
- Add new primitives via: `npx react-native-reusables/cli@latest add [component]`
- Feature components go in `components/` (not `ui/`).

### Data
- All data operations use `expo-sqlite`. Import and seed from `@/lib/seedData.json`.
- Use the `native-data-fetching` skill for all SQLite queries.
- Exercise categories map to 8 "Gold Standard" groups: Chest, Back, Shoulders, Biceps, Triceps, Legs, Core/Abs, Cardio.

### Routing
- Expo Router file-based routing. `app/_layout.tsx` is the root.
- Each tab gets its own file or folder under `app/`.
- Use `typedRoutes: true` (enabled in app.json).

## Workflow

> **One task at a time**: Work on only a **single task or sub-task at a time**, based on what the user asks for. Do not batch or pull additional work forward — finish the current item, then stop for the user before moving on.

**Mandatory completion sequence** — after finishing each task/sub-task, run these in order before doing anything else:

1. **`requesting-code-review`** — request a code review of the completed work.
2. **`receiving-code-review`** — process and respond to the review feedback (verify, then address it).
3. **Commit** — only commit **after** steps 1 and 2 are complete. Never commit before the code review cycle has run.

## Skill Usage

> **Strict Skill Restriction**: Only use skills from `.agents/skills/` in this project. Do not use external or global skills.

| Phase | Skill | When to Use |
|---|---|---|
| Ideation & Planning | `brainstorming` | **Mandatory** before any creative work, feature design, or UI changes |
| Planning | `executing-plans` | Multi-step implementation plans with checkpoints |
| UI Construction | `building-native-ui` | Expo Router layouts, navigation patterns, native mobile UI |
| Styling | `uniwind` | Any Tailwind className usage on React Native components |
| Native Modules | `expo-module` | Building/modifying custom native modules (Swift/Kotlin) |
| Dev Clients | `expo-dev-client` | Building and distributing local dev clients |
| API Routes | `expo-api-routes` | Backend logic in Expo Router API routes |
| Data & DB | `native-data-fetching` | All SQLite queries, network requests, caching |
| Performance | `vercel-react-best-practices` | React performance, hooks optimization, data-fetching patterns |
| Debugging | `systematic-debugging` | Any bug, crash, or unexpected behavior — before proposing fixes |
| Verification | `verification-before-completion` | Run final checks before marking a task done |
| Design Review | `web-design-guidelines` | Accessibility (A11y) and UX audits |
| Code Review | `requesting-code-review` | After implementing major features, before finishing work |
| Code Review | `receiving-code-review` | Responding to feedback or clarifying technical decisions |
| Git Workflows | `using-git-worktrees` | Isolating feature work from main workspace |
| Browser Testing | `npx agent-browser` | Web-based testing (React Native Web) |
