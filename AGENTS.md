# AGENTS.md

## Project Overview

**GymTracker** — a simple, fast gym workout tracker for managing weekly routines and logging exercises. Built with Expo, React Native Reusables, and SQLite. Runs on iOS, Android, and Web.

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Expo SDK 55, Expo Router v4 (file-based routing) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 via **Uniwind** |
| Component Library | **React Native Reusables** (shadcn/ui-style, built on `@rn-primitives`) |
| Database | `expo-sqlite` v55 |
| Icons | `lucide-react-native` |
| Animation | `react-native-reanimated` v4, `tw-animate-css` |
| Keyboard | `react-native-keyboard-controller` |
| Gestures | `react-native-gesture-handler` |

## Directory Structure

```
app/                  # Expo Router (file-based routes)
  _layout.tsx         # Root layout — Stack navigator, ThemeProvider
  index.tsx           # Entry screen
  +not-found.tsx      # 404
components/
  ui/                 # shadcn/ui primitives (Button, Text, etc.)
    button.tsx
    text.tsx
lib/
  seedData.json       # 1,324 exercises with body_part, target, equipment, images
  theme.ts            # Navigation theme (light/dark)
  utils.ts            # cn() — clsx + tailwind-merge
assets/
  exercises/
    images/           # 1,316 exercise illustration images (JPG)
    videos/           # Exercise animation GIFs
global.css            # Tailwind CSS variables (light/dark theme)
app.json              # Expo config
dataset.md            # Exercise taxonomy reference
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
