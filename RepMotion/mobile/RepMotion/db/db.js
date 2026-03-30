import * as SQLite from "expo-sqlite";

let dbPromise = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("repmotion.db");
  }
  return dbPromise;
}

export async function initDb() {
  const db = await getDb();

  await db.execAsync(`

    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,

      date_label TEXT NOT NULL,

      sets_count INTEGER NOT NULL DEFAULT 0,
      reps_total INTEGER NOT NULL DEFAULT 0,
      avg_velocity REAL NOT NULL DEFAULT 0,
      avg_tut REAL NOT NULL DEFAULT 0,

      has_sticking_point INTEGER NOT NULL DEFAULT 0,
      has_form_warning INTEGER NOT NULL DEFAULT 0,

      is_active INTEGER NOT NULL DEFAULT 1,

      started_at TEXT,
      ended_at TEXT,

      sync_status TEXT NOT NULL DEFAULT 'local'
    );

    CREATE TABLE IF NOT EXISTS session_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,

      session_id INTEGER NOT NULL,
      exercise_name TEXT NOT NULL,
      exercise_order INTEGER NOT NULL,

      created_at TEXT NOT NULL,

      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS session_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      server_id INTEGER,

      session_exercise_id INTEGER NOT NULL,

      set_label TEXT NOT NULL,
      set_order INTEGER NOT NULL,

      weight_kg REAL NOT NULL,

      reps INTEGER NOT NULL,
      avg_velocity REAL NOT NULL,
      max_velocity REAL NOT NULL,
      best_rep INTEGER NOT NULL,

      rom_deg REAL NOT NULL,
      duration_sec REAL NOT NULL,
      tut_sec REAL NOT NULL,

      form_score INTEGER NOT NULL,
      form_status TEXT NOT NULL,
      form_description TEXT NOT NULL,

      decline_text TEXT NOT NULL,
      sticking_point_text TEXT NOT NULL,
      sticking_point_rep INTEGER NOT NULL,
      sticking_point_percent REAL NOT NULL,

      velocities_json TEXT NOT NULL,

      created_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'local',

      FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id) ON DELETE CASCADE
    );
  `);
}

/* =========================================================
   CREATE SESSION
========================================================= */
export async function createSession({
  dateLabel,
  startedAt = null,
  endedAt = null,
  isActive = 1,
}) {
  const db = await getDb();

  const result = await db.runAsync(
    `
      INSERT INTO sessions (
        date_label,
        started_at,
        ended_at,
        is_active
      )
      VALUES (?, ?, ?, ?)
    `,
    [dateLabel, startedAt, endedAt, isActive],
  );

  return result.lastInsertRowId;
}

/* =========================================================
   GET OR CREATE SESSION EXERCISE
========================================================= */
export async function getOrCreateSessionExercise(sessionId, exerciseName) {
  const db = await getDb();

  const existing = await db.getFirstAsync(
    `
      SELECT *
      FROM session_exercises
      WHERE session_id = ? AND exercise_name = ?
      LIMIT 1
    `,
    [sessionId, exerciseName],
  );

  if (existing) return existing.id;

  const count = await db.getFirstAsync(
    `
      SELECT COUNT(*) as count
      FROM session_exercises
      WHERE session_id = ?
    `,
    [sessionId],
  );

  const order = (count?.count ?? 0) + 1;

  const result = await db.runAsync(
    `
      INSERT INTO session_exercises (
        session_id,
        exercise_name,
        exercise_order,
        created_at
      )
      VALUES (?, ?, ?, ?)
    `,
    [sessionId, exerciseName, order, new Date().toISOString()],
  );

  return result.lastInsertRowId;
}

/* =========================================================
   ADD SET TO SESSION
========================================================= */
export async function addSetToSession(sessionId, setData) {
  const db = await getDb();

  const sessionExerciseId = await getOrCreateSessionExercise(
    sessionId,
    setData.exercise,
  );

  const count = await db.getFirstAsync(
    `
      SELECT COUNT(*) as count
      FROM session_sets
      WHERE session_exercise_id = ?
    `,
    [sessionExerciseId],
  );

  const setOrder = (count?.count ?? 0) + 1;
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    `
      INSERT INTO session_sets (
        session_exercise_id,
        set_label,
        set_order,
        weight_kg,
        reps,
        avg_velocity,
        max_velocity,
        best_rep,
        rom_deg,
        duration_sec,
        tut_sec,
        form_score,
        form_status,
        form_description,
        decline_text,
        sticking_point_text,
        sticking_point_rep,
        sticking_point_percent,
        velocities_json,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      sessionExerciseId,
      setData.setLabel,
      setOrder,
      setData.weightKg,
      setData.reps,
      setData.avgVelocity,
      setData.maxVelocity,
      setData.bestRep,
      setData.romDeg,
      setData.durationSec,
      setData.tutSec,
      setData.formScore,
      setData.formStatus,
      setData.formDescription,
      setData.declineText,
      setData.stickingPointText,
      setData.stickingPointRep,
      setData.stickingPointPercent,
      JSON.stringify(setData.velocities),
      createdAt,
    ],
  );

  await recomputeSessionStats(sessionId);

  return result.lastInsertRowId;
}

/* =========================================================
   RECOMPUTE SESSION STATS
========================================================= */
export async function recomputeSessionStats(sessionId) {
  const db = await getDb();

  const sets = await db.getAllAsync(
    `
      SELECT
        ss.reps,
        ss.avg_velocity,
        ss.tut_sec,
        ss.sticking_point_rep,
        ss.form_score
      FROM session_sets ss
      INNER JOIN session_exercises se
        ON se.id = ss.session_exercise_id
      WHERE se.session_id = ?
      ORDER BY se.exercise_order ASC, ss.set_order ASC
    `,
    [sessionId],
  );

  const setsCount = sets.length;
  const repsTotal = sets.reduce((sum, item) => sum + (item.reps ?? 0), 0);

  const avgVelocity =
    setsCount > 0
      ? sets.reduce((sum, item) => sum + (item.avg_velocity ?? 0), 0) /
        setsCount
      : 0;

  const avgTut =
    setsCount > 0
      ? sets.reduce((sum, item) => sum + (item.tut_sec ?? 0), 0) / setsCount
      : 0;

  const hasStickingPoint = sets.some(
    (item) => (item.sticking_point_rep ?? 0) > 0,
  )
    ? 1
    : 0;

  const hasFormWarning = sets.some((item) => (item.form_score ?? 100) < 70)
    ? 1
    : 0;

  await db.runAsync(
    `
      UPDATE sessions
      SET
        sets_count = ?,
        reps_total = ?,
        avg_velocity = ?,
        avg_tut = ?,
        has_sticking_point = ?,
        has_form_warning = ?
      WHERE id = ?
    `,
    [
      setsCount,
      repsTotal,
      avgVelocity,
      avgTut,
      hasStickingPoint,
      hasFormWarning,
      sessionId,
    ],
  );
}

/* =========================================================
   GET SESSIONS WITH SETS
========================================================= */
export async function getSessionsWithSets() {
  const db = await getDb();

  const sessions = await db.getAllAsync(`
    SELECT *
    FROM sessions
    WHERE is_active = 0
    ORDER BY id DESC
  `);

  const exercises = await db.getAllAsync(`
    SELECT *
    FROM session_exercises
    ORDER BY session_id DESC, exercise_order ASC
  `);

  const sets = await db.getAllAsync(`
    SELECT *
    FROM session_sets
    ORDER BY session_exercise_id DESC, set_order ASC
  `);

  return sessions.map((session) => {
    const sessionExercises = exercises
      .filter((exercise) => exercise.session_id === session.id)
      .map((exercise) => {
        const exerciseSets = sets
          .filter((set) => set.session_exercise_id === exercise.id)
          .map((set) => ({
            id: String(set.id),
            setOrder: set.set_order,
            setLabel: set.set_label,
            exercise: exercise.exercise_name,
            weightKg: set.weight_kg,
            reps: set.reps,
            avgVelocity: set.avg_velocity,
            maxVelocity: set.max_velocity,
            bestRep: set.best_rep,
            romDeg: set.rom_deg,
            durationSec: set.duration_sec,
            tutSec: set.tut_sec,
            formScore: set.form_score,
            formStatus: set.form_status,
            formDescription: set.form_description,
            declineText: set.decline_text,
            stickingPointText: set.sticking_point_text,
            stickingPointRep: set.sticking_point_rep,
            stickingPointPercent: set.sticking_point_percent,
            velocities: JSON.parse(set.velocities_json ?? "[]"),
          }));

        return {
          id: String(exercise.id),
          exerciseName: exercise.exercise_name,
          exerciseOrder: exercise.exercise_order,
          sets: exerciseSets,
        };
      });

    const flatSets = sessionExercises.flatMap((exercise) => exercise.sets);

    return {
      id: String(session.id),
      dateLabel: session.date_label,
      setsCount: session.sets_count,
      repsTotal: session.reps_total,
      avgVelocity: session.avg_velocity,
      avgTUT: session.avg_tut,
      hasStickingPoint: !!session.has_sticking_point,
      hasFormWarning: !!session.has_form_warning,
      exercises: sessionExercises,
      sets: flatSets,
    };
  });
}

/* =========================================================
   GET LAST SESSION WITH SETS
========================================================= */
export async function getLastSessionWithSets() {
  const sessions = await getSessionsWithSets();
  return sessions.length > 0 ? sessions[0] : null;
}

/* =========================================================
   GET ACTIVE SESSION
========================================================= */
export async function getActiveSession() {
  const db = await getDb();

  const session = await db.getFirstAsync(`
  SELECT *
  FROM sessions
  WHERE is_active = 1
  ORDER BY id DESC
  LIMIT 1
`);

  if (!session) return null;

  const exercises = await db.getAllAsync(
    `
      SELECT *
      FROM session_exercises
      WHERE session_id = ?
      ORDER BY exercise_order ASC
    `,
    [session.id],
  );

  const sets = await db.getAllAsync(
    `
      SELECT ss.*, se.exercise_name
      FROM session_sets ss
      INNER JOIN session_exercises se
        ON se.id = ss.session_exercise_id
      WHERE se.session_id = ?
      ORDER BY se.exercise_order ASC, ss.set_order ASC
    `,
    [session.id],
  );

  const mappedExercises = exercises.map((exercise) => {
    const exerciseSets = sets
      .filter((set) => set.session_exercise_id === exercise.id)
      .map((set) => ({
        id: String(set.id),
        setOrder: set.set_order,
        setLabel: set.set_label,
        exercise: set.exercise_name,
        weightKg: set.weight_kg,
        reps: set.reps,
        avgVelocity: set.avg_velocity,
        maxVelocity: set.max_velocity,
        bestRep: set.best_rep,
        romDeg: set.rom_deg,
        durationSec: set.duration_sec,
        tutSec: set.tut_sec,
        formScore: set.form_score,
        formStatus: set.form_status,
        formDescription: set.form_description,
        declineText: set.decline_text,
        stickingPointText: set.sticking_point_text,
        stickingPointRep: set.sticking_point_rep,
        stickingPointPercent: set.sticking_point_percent,
        velocities: JSON.parse(set.velocities_json ?? "[]"),
      }));

    return {
      id: String(exercise.id),
      exerciseName: exercise.exercise_name,
      exerciseOrder: exercise.exercise_order,
      sets: exerciseSets,
    };
  });

  const flatSets = mappedExercises.flatMap((exercise) => exercise.sets);

  return {
    id: String(session.id),
    dateLabel: session.date_label,
    setsCount: session.sets_count,
    repsTotal: session.reps_total,
    avgVelocity: session.avg_velocity,
    avgTUT: session.avg_tut,
    hasStickingPoint: !!session.has_sticking_point,
    hasFormWarning: !!session.has_form_warning,
    exercises: mappedExercises,
    sets: flatSets,
  };
}

/* =========================================================
   CLOSE SESSION
========================================================= */
export async function closeSession(sessionId) {
  const db = await getDb();

  await db.runAsync(
    `
      UPDATE sessions
      SET
        is_active = 0,
        ended_at = ?
      WHERE id = ?
    `,
    [new Date().toISOString(), sessionId],
  );
}

export async function deleteSession(sessionId) {
  const db = await getDb();

  await db.runAsync(
    `
      DELETE FROM sessions
      WHERE id = ?
    `,
    [sessionId],
  );
}
