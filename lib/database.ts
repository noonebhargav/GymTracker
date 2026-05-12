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

export type ExerciseRow = {
  id: string;
  name: string;
  body_part: string;
  target: string | null;
  muscle_group: string | null;
  equipment: string | null;
  assetId: string | null;
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

    CREATE INDEX IF NOT EXISTS idx_workout_logs_date_exercise ON workout_logs(date_logged, exercise_id);
    CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise_date ON workout_logs(exercise_id, date_logged);
    CREATE INDEX IF NOT EXISTS idx_workout_logs_body_part_date ON workout_logs(body_part, date_logged);
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

export async function getAllExercises(
  db: SQLiteDatabase
): Promise<ExerciseRow[]> {
  return db.getAllAsync<ExerciseRow>(
    'SELECT id, name, body_part, target, muscle_group, equipment, assetId FROM exercises ORDER BY name'
  );
}

export async function searchExercises(
  db: SQLiteDatabase,
  query: string
): Promise<ExerciseRow[]> {
  const pattern = `%${query}%`;
  return db.getAllAsync<ExerciseRow>(
    `SELECT id, name, body_part, target, muscle_group, equipment, assetId
     FROM exercises
     WHERE name LIKE ? OR body_part LIKE ? OR target LIKE ? OR equipment LIKE ?
     ORDER BY name`,
    pattern,
    pattern,
    pattern,
    pattern
  );
}

export async function getExercisesByEquipment(
  db: SQLiteDatabase,
  equipment: string
): Promise<ExerciseRow[]> {
  return db.getAllAsync<ExerciseRow>(
    'SELECT id, name, body_part, target, muscle_group, equipment, assetId FROM exercises WHERE equipment = ? ORDER BY name',
    equipment
  );
}

export async function getExercisesByEquipmentList(
  db: SQLiteDatabase,
  equipments: string[]
): Promise<ExerciseRow[]> {
  if (equipments.length === 0) return [];
  const placeholders = equipments.map(() => '?').join(', ');
  return db.getAllAsync<ExerciseRow>(
    `SELECT id, name, body_part, target, muscle_group, equipment, assetId FROM exercises WHERE equipment IN (${placeholders}) ORDER BY name`,
    ...equipments
  );
}

export type ExerciseDetail = ExerciseRow & {
  secondary_muscles: string;
  instruction_steps: string;
};

export async function getExerciseById(
  db: SQLiteDatabase,
  id: string
): Promise<ExerciseDetail | null> {
  return db.getFirstAsync<ExerciseDetail>(
    'SELECT * FROM exercises WHERE id = ?',
    id
  );
}

export type RoutineRow = {
  day_of_week: number;
  body_part: string;
};

export async function getAllRoutines(
  db: SQLiteDatabase
): Promise<RoutineRow[]> {
  return db.getAllAsync<RoutineRow>(
    'SELECT day_of_week, body_part FROM routines ORDER BY day_of_week, body_part'
  );
}

export async function setRoutineDay(
  db: SQLiteDatabase,
  dayOfWeek: number,
  bodyParts: string[]
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'DELETE FROM routines WHERE day_of_week = ?',
      dayOfWeek
    );
    for (const part of bodyParts) {
      await db.runAsync(
        'INSERT INTO routines (day_of_week, body_part) VALUES (?, ?)',
        dayOfWeek,
        part
      );
    }
  });
}

export async function getSetting(
  db: SQLiteDatabase,
  key: string
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    key
  );
  return row?.value ?? null;
}

export async function setSetting(
  db: SQLiteDatabase,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}

export async function getLoggedBodyPartsForDate(
  db: SQLiteDatabase,
  date: string
): Promise<string[]> {
  const rows = await db.getAllAsync<{ body_part: string }>(
    'SELECT DISTINCT body_part FROM workout_logs WHERE date_logged = ?',
    date
  );
  return rows.map((r) => r.body_part);
}

export type RecentExerciseRow = {
  exercise_id: string;
  last_date: string;
};

export async function getRecentExercises(
  db: SQLiteDatabase,
  bodyParts: string[],
  limit = 20
): Promise<RecentExerciseRow[]> {
  if (bodyParts.length === 0) return [];
  const placeholders = bodyParts.map(() => '?').join(', ');
  return db.getAllAsync<RecentExerciseRow>(
    `SELECT exercise_id, MAX(date_logged) as last_date
     FROM workout_logs
     WHERE body_part IN (${placeholders})
     GROUP BY exercise_id
     ORDER BY last_date DESC
     LIMIT ?`,
    ...bodyParts,
    limit
  );
}

export type WorkoutSetRow = {
  set_number: number;
  weight: number;
  reps: number;
};

export async function getLastWorkoutSets(
  db: SQLiteDatabase,
  exerciseId: string
): Promise<WorkoutSetRow[]> {
  return db.getAllAsync<WorkoutSetRow>(
    `SELECT set_number, weight, reps
     FROM workout_logs
     WHERE exercise_id = ?
       AND date_logged = (
         SELECT MAX(date_logged) FROM workout_logs WHERE exercise_id = ?
       )
     ORDER BY set_number`,
    exerciseId,
    exerciseId
  );
}

export type WorkoutSetInput = {
  exercise_id: string;
  set_number: number;
  weight: number;
  reps: number;
  date_logged: string;
  body_part: string;
};

export async function insertWorkoutSets(
  db: SQLiteDatabase,
  sets: WorkoutSetInput[]
): Promise<void> {
  if (sets.length === 0) return;
  await db.withTransactionAsync(async () => {
    for (const s of sets) {
      await db.runAsync(
        `INSERT INTO workout_logs (exercise_id, set_number, weight, reps, date_logged, body_part)
         VALUES (?, ?, ?, ?, ?, ?)`,
        s.exercise_id,
        s.set_number,
        s.weight,
        s.reps,
        s.date_logged,
        s.body_part
      );
    }
  });
}

export async function deleteWorkoutSets(
  db: SQLiteDatabase,
  date: string,
  exerciseId: string
): Promise<void> {
  await db.runAsync(
    'DELETE FROM workout_logs WHERE date_logged = ? AND exercise_id = ?',
    date,
    exerciseId
  );
}

export async function getWorkoutLogsForToday(
  db: SQLiteDatabase,
  date: string
): Promise<{ exercise_id: string }[]> {
  return db.getAllAsync<{ exercise_id: string }>(
    'SELECT DISTINCT exercise_id FROM workout_logs WHERE date_logged = ?',
    date
  );
}

export async function getWorkoutSetsForDate(
  db: SQLiteDatabase,
  date: string,
  exerciseId: string
): Promise<WorkoutSetRow[]> {
  return db.getAllAsync<WorkoutSetRow>(
    'SELECT set_number, weight, reps FROM workout_logs WHERE date_logged = ? AND exercise_id = ? ORDER BY set_number',
    date,
    exerciseId
  );
}
