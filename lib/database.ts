import { type SQLiteDatabase } from 'expo-sqlite';
import seedData from '@/lib/seed_data.json';

type ExerciseSeed = {
  id: string;
  name: string;
  body_part: string;
  target?: string;
  muscle_group?: string;
  equipment?: string;
  secondary_muscles?: string[];
  instruction_steps?: string[];
  assetId?: string;
};

export async function initAndSeedDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      body_part TEXT NOT NULL,
      target TEXT,
      muscle_group TEXT,
      equipment TEXT,
      secondary_muscles TEXT,
      instruction_steps TEXT,
      assetId TEXT
    );

    CREATE TABLE IF NOT EXISTS routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_of_week INTEGER NOT NULL,
      body_part TEXT NOT NULL,
      UNIQUE(day_of_week, body_part)
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      weight REAL NOT NULL,
      reps INTEGER NOT NULL,
      date_logged TEXT NOT NULL,
      body_part TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const sealed = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'seeded'"
  );

  if (sealed?.value === 'true') return;

  const exercises = seedData as ExerciseSeed[];

  await db.withTransactionAsync(async () => {
    for (const exercise of exercises) {
      await db.runAsync(
        `INSERT OR IGNORE INTO exercises (id, name, body_part, target, muscle_group, equipment, secondary_muscles, instruction_steps, assetId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        exercise.id,
        exercise.name,
        exercise.body_part,
        exercise.target ?? null,
        exercise.muscle_group ?? null,
        exercise.equipment ?? null,
        JSON.stringify(exercise.secondary_muscles ?? []),
        JSON.stringify(exercise.instruction_steps ?? []),
        exercise.assetId ?? null
      );
    }
  });

  await db.runAsync(
    "INSERT OR REPLACE INTO settings (key, value) VALUES ('seeded', 'true')"
  );
}

export async function getExerciseCount(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercises'
  );
  return row?.count ?? 0;
}
