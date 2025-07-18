CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_library (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    crossword_grid_id INTEGER,
    solver_grid_id INTEGER
);

CREATE TABLE IF NOT EXISTS crossword_grids (
    grid_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puzzle_title VARCHAR(100),
    grid_size INTEGER,
    grid_values TEXT[],
    grid_numbers INTEGER[],
    black_squares BOOLEAN[],
    across_clues TEXT[],
    down_clues TEXT[],
    clue_number_directions TEXT[]
);

CREATE TABLE IF NOT EXISTS solver_grids (
    grid_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_status BOOLEAN,
    puzzle_title VARCHAR(100),
    grid_size INTEGER,
    grid_values TEXT[],
    grid_numbers INTEGER[],
    black_squares BOOLEAN[],
    across_clues TEXT[],
    down_clues TEXT[],
    clue_number_directions TEXT[]
);

CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    created TIMESTAMP(6) NOT NULL DEFAULT now(),
    modified TIMESTAMP(6) NOT NULL DEFAULT now()
);
```