-- Adds the keys and constraints the original schema was missing, after cleaning up the duplicate
-- rows the old code could create. The runner applies each migration in one transaction, so if any
-- step fails, nothing changes.

-- 1. Solver copies with no owner can't be opened by anyone.
DELETE FROM solver_grids WHERE user_id IS NULL;

-- 2. Sharing a puzzle twice with the same person created duplicate copies. The old save route
--    updated every copy of a puzzle at once, so duplicates hold identical progress. Keep one.
DELETE FROM solver_grids a
USING solver_grids b
WHERE a.grid_id = b.grid_id
  AND a.user_id = b.user_id
  AND a.ctid > b.ctid;

ALTER TABLE solver_grids ADD CONSTRAINT solver_grids_pkey PRIMARY KEY (grid_id, user_id);

-- 3. Google sign-in could reuse a display name someone else already had. Rename the extra
--    Google-only accounts (they never log in by username) so usernames can be unique.
DO $$
DECLARE
  dup RECORD;
  candidate TEXT;
  suffix INT;
BEGIN
  FOR dup IN
    SELECT u.user_id, u.username
    FROM users u
    WHERE u.password IS NULL
      AND EXISTS (
        SELECT 1 FROM users other
        WHERE other.username = u.username
          AND other.user_id <> u.user_id
          AND (other.password IS NOT NULL OR other.user_id < u.user_id)
      )
    ORDER BY u.user_id
  LOOP
    suffix := 2;
    LOOP
      candidate := left(dup.username, 45) || ' ' || suffix;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM users WHERE username = candidate);
      suffix := suffix + 1;
    END LOOP;
    UPDATE users SET username = candidate WHERE user_id = dup.user_id;
    RAISE NOTICE 'Renamed Google account % from "%" to "%"', dup.user_id, dup.username, candidate;
  END LOOP;

  IF EXISTS (SELECT 1 FROM users GROUP BY username HAVING count(*) > 1) THEN
    RAISE EXCEPTION 'Some password accounts share a username. Rename all but one of them, then run the migrations again.';
  END IF;
END $$;

ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT users_google_id_key UNIQUE (google_id);

-- 4. Foreign keys. NOT VALID enforces them for new rows straight away. The blocks below then check
--    existing rows, and log a notice instead of failing if old orphaned rows are found.
ALTER TABLE crossword_grids
  ADD CONSTRAINT crossword_grids_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE NOT VALID;

-- A shared puzzle can't be deleted while someone still has a copy of it.
ALTER TABLE solver_grids
  ADD CONSTRAINT solver_grids_grid_id_fkey
  FOREIGN KEY (grid_id) REFERENCES crossword_grids(grid_id) ON DELETE RESTRICT NOT VALID;

DO $$
BEGIN
  ALTER TABLE crossword_grids VALIDATE CONSTRAINT crossword_grids_user_id_fkey;
EXCEPTION WHEN foreign_key_violation THEN
  RAISE NOTICE 'Some crossword_grids rows point to users that no longer exist. New rows are still checked.';
END $$;

DO $$
BEGIN
  ALTER TABLE solver_grids VALIDATE CONSTRAINT solver_grids_grid_id_fkey;
EXCEPTION WHEN foreign_key_violation THEN
  RAISE NOTICE 'Some solver_grids rows point to puzzles that no longer exist. New rows are still checked.';
END $$;

DO $$
BEGIN
  ALTER TABLE crossword_grids ALTER COLUMN user_id SET NOT NULL;
EXCEPTION WHEN not_null_violation THEN
  RAISE NOTICE 'Some crossword_grids rows have no owner, so user_id stays nullable.';
END $$;

-- 5. Indexes for the lookups the app runs on most pages.
CREATE INDEX IF NOT EXISTS crossword_grids_user_id_idx ON crossword_grids (user_id);
CREATE INDEX IF NOT EXISTS solver_grids_user_id_idx ON solver_grids (user_id);
CREATE INDEX IF NOT EXISTS users_lower_email_idx ON users (lower(email));
CREATE INDEX IF NOT EXISTS session_expire_idx ON session (expire);

-- 6. The library is now read straight from crossword_grids and solver_grids.
COMMENT ON TABLE user_library IS
  'Unused since migration 002. Library data comes from crossword_grids and solver_grids. Safe to drop.';
