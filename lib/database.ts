import { type SQLiteDatabase } from 'expo-sqlite';
import seedData from '@/lib/seed_data.json';
import { formatLocalDate, mapJsDayToOur } from '@/lib/date-utils';

const LBS_FACTOR = 2.205;

export function displayWeight(kg: number, unit: 'lbs' | 'kg'): number {
  if (unit === 'kg') return Math.round(kg / 2.5) * 2.5;
  return Math.round((kg * LBS_FACTOR) / 5) * 5;
}

export function toKg(value: number, fromUnit: 'lbs' | 'kg'): number {
  if (fromUnit === 'kg') return value;
  return Math.round((value / LBS_FACTOR) / 2.5) * 2.5;
}

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

export async function resetAllData(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM workout_logs');
    await db.execAsync('DELETE FROM routines');
    await db.execAsync('DELETE FROM settings');

    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES ('seeded', 'true')"
    );
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES ('default_sets', '3')"
    );
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES ('default_weight', '20')"
    );
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES ('default_reps', '10')"
    );
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES ('weight_unit', 'lbs')"
    );
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES ('queue_enabled', 'false')"
    );
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES ('theme', 'system')"
    );
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES ('accent_color', 'lime')"
    );
  });
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

export async function getRecentExercises(
  db: SQLiteDatabase,
  bodyParts: string[],
  limit = 20
): Promise<ExerciseRow[]> {
  if (bodyParts.length === 0) return [];
  const placeholders = bodyParts.map(() => '?').join(', ');
  return db.getAllAsync<ExerciseRow>(
    `SELECT e.id, e.name, e.body_part, e.target, e.muscle_group, e.equipment, e.assetId
     FROM workout_logs wl
     JOIN exercises e ON wl.exercise_id = e.id
     WHERE wl.body_part IN (${placeholders})
     GROUP BY wl.exercise_id
      ORDER BY MAX(wl.date_logged) DESC, MAX(wl.created_at) DESC
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

export async function replaceWorkoutSets(
  db: SQLiteDatabase,
  date: string,
  exerciseId: string,
  sets: WorkoutSetInput[]
): Promise<void> {
  await db.withTransactionAsync(async () => {
    const existing = await db.getAllAsync<{
      id: number;
      set_number: number;
      weight: number;
      reps: number;
      body_part: string;
    }>(
      'SELECT id, set_number, weight, reps, body_part FROM workout_logs WHERE date_logged = ? AND exercise_id = ?',
      date,
      exerciseId
    );
    const existingBySetNumber = new Map(existing.map((r) => [r.set_number, r]));
    const incomingSetNumbers = new Set(sets.map((s) => s.set_number));

    for (const row of existing) {
      if (!incomingSetNumbers.has(row.set_number)) {
        await db.runAsync('DELETE FROM workout_logs WHERE id = ?', row.id);
      }
    }

    for (const s of sets) {
      const prev = existingBySetNumber.get(s.set_number);
      if (!prev) {
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
      } else if (
        prev.weight !== s.weight ||
        prev.reps !== s.reps ||
        prev.body_part !== s.body_part
      ) {
        await db.runAsync(
          'UPDATE workout_logs SET weight = ?, reps = ?, body_part = ? WHERE id = ?',
          s.weight,
          s.reps,
          s.body_part,
          prev.id
        );
      }
    }
  });
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

export type WorkoutDateRow = {
  date_logged: string;
};

export async function getWorkoutDates(
  db: SQLiteDatabase
): Promise<WorkoutDateRow[]> {
  return db.getAllAsync<WorkoutDateRow>(
    'SELECT DISTINCT date_logged FROM workout_logs ORDER BY date_logged'
  );
}

export type DateRangeRow = {
  first_date: string | null;
  last_date: string | null;
};

export async function getWorkoutDateRange(
  db: SQLiteDatabase
): Promise<DateRangeRow | null> {
  return db.getFirstAsync<DateRangeRow>(
    'SELECT MIN(date_logged) as first_date, MAX(date_logged) as last_date FROM workout_logs'
  );
}

export type DayWorkoutDetailRow = {
  exercise_id: string;
  exercise_name: string;
  body_part: string;
  equipment: string | null;
  assetId: string | null;
  set_number: number;
  weight: number;
  reps: number;
};

export async function getDayWorkoutDetail(
  db: SQLiteDatabase,
  date: string
): Promise<DayWorkoutDetailRow[]> {
  return db.getAllAsync<DayWorkoutDetailRow>(
    `SELECT
      wl.exercise_id,
      e.name as exercise_name,
      wl.body_part,
      e.equipment,
      e.assetId,
      wl.set_number,
      wl.weight,
      wl.reps
    FROM workout_logs wl
    JOIN exercises e ON wl.exercise_id = e.id
    WHERE wl.date_logged = ?
    ORDER BY wl.exercise_id, wl.set_number`,
    date
  );
}

export type DayAggregateRow = {
  date_logged: string;
  exercise_count: number;
  set_count: number;
  avg_weight: number;
  avg_reps: number;
  body_parts: string;
};

export async function getMonthlyAggregates(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string
): Promise<DayAggregateRow[]> {
  return db.getAllAsync<DayAggregateRow>(
    `SELECT
      date_logged,
      COUNT(DISTINCT exercise_id) as exercise_count,
      COUNT(*) as set_count,
      AVG(CAST(weight AS REAL)) as avg_weight,
      AVG(CAST(reps AS REAL)) as avg_reps,
      GROUP_CONCAT(DISTINCT body_part) as body_parts
    FROM workout_logs
    WHERE date_logged >= ? AND date_logged <= ?
    GROUP BY date_logged
    ORDER BY date_logged`,
    startDate,
    endDate
  );
}

// Returns the kg PR weight iff the exercise's all-time max weight was FIRST achieved on
// `date` (the chip means "you set or first tied your PR on this day"). A later session that
// only ties an existing PR returns null, since the PR was first reached on an earlier date.
// Re-derived on every set-editor load so the chip persists across navigation.
// CAST is applied consistently in both the outer aggregate and the inner subquery so the
// comparison stays numeric even if a weight is ever stored as text.
export async function getExercisePRForDate(
  db: SQLiteDatabase,
  exerciseId: string,
  date: string
): Promise<number | null> {
  const row = await db.getFirstAsync<{ max_weight: number | null; first_date: string | null }>(
    `SELECT MAX(CAST(weight AS REAL)) as max_weight, MIN(date_logged) as first_date
     FROM workout_logs
     WHERE exercise_id = ?
       AND CAST(weight AS REAL) = (SELECT MAX(CAST(weight AS REAL)) FROM workout_logs WHERE exercise_id = ?)`,
    exerciseId,
    exerciseId
  );
  if (!row || row.max_weight == null || row.first_date !== date) return null;
  return row.max_weight;
}

export async function getWorkoutStreak(db: SQLiteDatabase): Promise<number> {
  const logged = await db.getAllAsync<{ date_logged: string }>(
    `SELECT DISTINCT date_logged FROM workout_logs`
  );
  if (logged.length === 0) return 0;
  const loggedSet = new Set(logged.map((r) => r.date_logged));

  const routineRows = await db.getAllAsync<{ day_of_week: number }>(
    `SELECT DISTINCT day_of_week FROM routines`
  );
  const scheduledDays = new Set(routineRows.map((r) => r.day_of_week));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const cursor = new Date(today);
  let gracedToday = false;
  // Safety bound: walk back at most ~3 years to avoid pathological loops on routines with very few scheduled days.
  for (let i = 0; i < 365 * 3; i++) {
    // Skip routine rest days only if a routine exists.
    if (scheduledDays.size > 0 && !scheduledDays.has(mapJsDayToOur(cursor.getDay()))) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    const ds = formatLocalDate(cursor);
    if (loggedSet.has(ds)) {
      streak++;
    } else if (!gracedToday && cursor.getTime() === today.getTime()) {
      gracedToday = true;
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type BodyPartAvgRow = {
  body_part: string;
  avg_weight: number;
};

export async function getBodyPartAvgWeights(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string
): Promise<BodyPartAvgRow[]> {
  return db.getAllAsync<BodyPartAvgRow>(
    `SELECT body_part, AVG(CAST(weight AS REAL)) as avg_weight
     FROM workout_logs
     WHERE date_logged >= ? AND date_logged <= ?
     GROUP BY body_part`,
    startDate,
    endDate
  );
}

export type WindowPRRow = {
  exercise_id: string;
  exercise_name: string;
  max_weight: number;
  best_date: string;
};

export async function getWindowPRs(
  db: SQLiteDatabase,
  windowStart: string,
  windowEnd: string
): Promise<WindowPRRow[]> {
  return db.getAllAsync<WindowPRRow>(
    `SELECT
       sub.exercise_id,
       e.name AS exercise_name,
       sub.max_weight,
       (
         SELECT wl2.date_logged
         FROM workout_logs wl2
         WHERE wl2.exercise_id = sub.exercise_id
           AND wl2.weight = sub.max_weight
           AND wl2.date_logged >= ?
           AND wl2.date_logged <= ?
         ORDER BY wl2.date_logged DESC
         LIMIT 1
       ) AS best_date
     FROM (
       SELECT wl.exercise_id, MAX(wl.weight) AS max_weight
       FROM workout_logs wl
       WHERE wl.date_logged >= ? AND wl.date_logged <= ?
         AND wl.weight > COALESCE((
           SELECT MAX(weight) FROM workout_logs
           WHERE exercise_id = wl.exercise_id AND date_logged < ?
         ), 0)
       GROUP BY wl.exercise_id
     ) sub
     JOIN exercises e ON sub.exercise_id = e.id
     ORDER BY best_date DESC`,
    windowStart,
    windowEnd,
    windowStart,
    windowEnd,
    windowStart
  );
}
