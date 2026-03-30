-- ======================================================
-- CLEAN
-- ======================================================
DROP TABLE IF EXISTS session_sets;
DROP TABLE IF EXISTS session_exercises;
DROP TABLE IF EXISTS sessions;

-- ======================================================
-- SESSIONS
-- ======================================================
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    date_label VARCHAR(100) NOT NULL,

    sets_count INT NOT NULL DEFAULT 0,
    reps_total INT NOT NULL DEFAULT 0,
    avg_velocity DECIMAL(6,3) NOT NULL DEFAULT 0,
    avg_tut DECIMAL(6,3) NOT NULL DEFAULT 0,

    has_sticking_point BOOLEAN NOT NULL DEFAULT FALSE,
    has_form_warning BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    started_at DATETIME NULL,
    ended_at DATETIME NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

-- ======================================================
-- SESSION EXERCISES
-- ======================================================
CREATE TABLE session_exercises (
    id INT AUTO_INCREMENT PRIMARY KEY,

    session_id INT NOT NULL,

    exercise_name VARCHAR(100) NOT NULL,
    exercise_order INT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_exercises_session
      FOREIGN KEY (session_id) REFERENCES sessions(id)
      ON DELETE CASCADE
);

CREATE INDEX idx_session_exercises_session_id ON session_exercises(session_id);
CREATE INDEX idx_session_exercises_order ON session_exercises(session_id, exercise_order);

-- ======================================================
-- SESSION SETS
-- ======================================================
CREATE TABLE session_sets (
    id INT AUTO_INCREMENT PRIMARY KEY,

    session_exercise_id INT NOT NULL,

    set_label VARCHAR(50) NOT NULL,
    set_order INT NOT NULL,

    weight_kg DECIMAL(6,2) NOT NULL,

    reps INT NOT NULL,
    avg_velocity DECIMAL(6,3) NOT NULL,
    max_velocity DECIMAL(6,3) NOT NULL,
    best_rep INT NOT NULL,

    rom_deg DECIMAL(6,2) NOT NULL,
    duration_sec DECIMAL(6,2) NOT NULL,
    tut_sec DECIMAL(6,2) NOT NULL,

    form_score INT NOT NULL,
    form_status VARCHAR(50) NOT NULL,
    form_description TEXT NOT NULL,

    decline_text VARCHAR(255) NOT NULL,
    sticking_point_text VARCHAR(255) NOT NULL,
    sticking_point_rep INT NOT NULL,
    sticking_point_percent DECIMAL(5,2) NOT NULL,

    velocities_json JSON NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_sets_session_exercise
      FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id)
      ON DELETE CASCADE
);

CREATE INDEX idx_session_sets_session_exercise_id ON session_sets(session_exercise_id);
CREATE INDEX idx_session_sets_order ON session_sets(session_exercise_id, set_order);