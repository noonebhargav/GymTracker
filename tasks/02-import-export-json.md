# Task 2 — Import / Export user data as JSON (replace-all)

**Status:** todo
**New deps:** `expo-file-system`, `expo-sharing`, `expo-document-picker` (SDK 56) · **Risk:** medium · Requires dev-client rebuild.

## Why
Users have no way to back up or move their data. Add JSON export + import. Import is **replace-all** (restore-a-backup semantics).

## Scope
**2a. DB layer** — `lib/database.ts`:
- `exportUserData(db)` → `{ version: 1, exportedAt, routines[], workout_logs[], settings{} }`. All rows from `routines` + `workout_logs`; user-facing settings keys (the list in `resetAllData`, excluding `seeded`). **Exclude** the static `exercises` table.
- `importUserData(db, payload)` → validate `version`; in one `withTransactionAsync`: DELETE from `routines`/`workout_logs`/`settings`, re-insert `seeded='true'`, bulk-insert payload rows + settings. Mirror `resetAllData`'s transaction shape (`database.ts:243-274`). Defensively skip rows with unknown `exercise_id` (or reject + count).

**2b. Settings UI** — `app/(tabs)/settings.tsx`: add a **"Data"** `SectionHeader` with two `Pressable` rows (pattern at `settings.tsx:370-379`):
- **Export** → `exportUserData` → write JSON to cache via `expo-file-system` → `Sharing.shareAsync` (native) / browser download (web). Filename `gymtracker-backup-YYYY-MM-DD.json`.
- **Import** → `DocumentPicker.getDocumentAsync({ type: 'application/json' })` → read + parse → confirm via existing `AlertDialog` ("This replaces all current data") → `importUserData` → reload settings state.

## Files
- `lib/database.ts`
- `app/(tabs)/settings.tsx`
- `package.json`

## Verify
- `npx tsc --noEmit`
- Export → JSON has routines/logs/settings but **not** `exercises`.
- Reset all → import the file → data restored exactly.
- Malformed file rejected gracefully (no crash).
- Web export/import path works (download + file input).
