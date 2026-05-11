# GymTracker Skill Usage Guide

> [!IMPORTANT]
> **Strict Skill Restriction**: ONLY use the skills listed below, which are locally available in the `.agents/skills` directory of this project. Do not use any external or global skills.

This document maps available agent skills to specific development phases of the GymTracker React Native project.

## Core Development Flow

### 1. Ideation & Planning
- **`brainstorming`**: **(Mandatory)** Use before any creative work, feature design, or UI changes. It helps explore intent and requirements.
- **`executing-plans`**: Use when you have a multi-step implementation plan to track progress and checkpoints.

### 2. UI & Component Construction
- **`building-native-ui`**: The primary skill for Expo Router, navigation patterns, and native mobile UI structures.
- **`uniwind`**: Use whenever styling components. This project uses Tailwind CSS v4 for React Native.

### 3. Native & Platform Features
- **`expo-module`**: Use when building or modifying custom native modules (Swift/Kotlin).
- **`expo-dev-client`**: Use for building and distributing local development clients.
- **`expo-api-routes`**: Use if implementing backend logic within Expo Router's API routes.

### 4. Logic & Data
- **`native-data-fetching`**: Use for all data operations, including **Expo SQLite** interactions and network requests.
- **`vercel-react-best-practices`**: Use to optimize React performance, hooks usage, and data-fetching patterns.

### 5. Quality Assurance & Testing
- **`systematic-debugging`**: Use for investigating any bug, crash, or unexpected behavior before proposing a fix.
- **`verification-before-completion`**: Use to run final checks and evidence collection before marking a task as done.
- **Browser Testing**: For web-based testing (React Native Web), use the local `agent-browser` tool:
  ```bash
  npx agent-browser <command>
  ```
- **`web-design-guidelines`**: Use for accessibility (A11y) and UX audits.

### 6. Workflow & Git
- **`using-git-worktrees`**: Use when starting feature work that needs to be isolated from the main workspace.
- **`requesting-code-review`**: Use when implementing major features or before finishing work to ensure quality.
- **`receiving-code-review`**: Use when responding to feedback or clarifying technical decisions.

