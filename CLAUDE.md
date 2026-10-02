# Crossword Crew

Make crosswords, share them with friends, and solve the ones they send back. A full-stack web app:
React frontend, Express and PostgreSQL backend, shipped as one Docker image. Open source (MIT) on the
**muuscodes** GitHub account.

## Stack

- **Frontend** (`frontend/`): React 19, React Router 8, TypeScript 6, Vite 8, Tailwind CSS 4, Font Awesome,
  date-fns, Libre Franklin (self-hosted). Tests: Vitest and Testing Library on jsdom. Lint: ESLint 10 with
  react-hooks 7, which enforces the React Compiler rules.
- **Backend** (`backend/`): Node 24, plain JavaScript ES modules, Express 5, express-session with
  connect-pg-simple, Passport (Google sign-in), bcrypt, express-validator, express-rate-limit, nodemailer
  (Gmail). Tests: Vitest and supertest against PGlite (Postgres in WebAssembly), so tests need no database.
- **Database**: PostgreSQL 17 with plain SQL migrations in `backend/migrations/`.
- Node 24 everywhere (`.nvmrc`).

## Commands

| | Frontend (`cd frontend`) | Backend (`cd backend`) |
| --- | --- | --- |
| Install | `npm install` | `npm install` |
| Develop | `npm run dev` (Vite on :5173, proxies `/auth`, `/users`, `/email` to :3000) | `npm run dev` (port 3000, restarts on change) |
| Test | `npm test` | `npm test` |
| Lint | `npm run lint` | none |
| Type check and build | `npm run build` | none |
| Migrate | | `npm run migrate` |

The whole app: `docker compose up --build` (app on :3000, Postgres on :5433). CI
(`.github/workflows/ci.yml`) runs the same checks. No formatter is configured.

## Structure

```
backend/
  migrations/      numbered .sql files; the server refuses to start while any are pending
  src/app.js       createApp(): middleware and routers built from an injected db, mailer and config
  src/server.js    real startup: config, Postgres pool, session store, mailer, graceful shutdown
  src/routes/      auth, grids (create, edit, share, solve, check, reveal), account, people, email (feedback)
  src/middleware/  auth, validation (express-validator plus parsePuzzle), rate limits, errors
  src/lib/         crossword rules, HttpError, passwords, HTML escaping
  test/            one file per area; helpers.js builds a PGlite-backed app for each test
frontend/
  src/lib/         crossword engine (crossword.ts, crosswordReducer.ts, useCrossword.ts) and api.ts
  src/components/
    Crossword/     the grid, clue list, clue bar, phone keyboard and workspace shared by Create, Edit, Solve
    Common/        Modal, PageHeader, SaveButton, MenuButton, UserSearch, styles.ts (design tokens)
    AuthContent/   logged-in pages
    NonAuthContent/ landing page and the log in / sign up dialog
    BaseContent/   layout, navbar, footer, protected routes
  src/__tests__/   testUtils.jsx has mockApi() and renderPage()
```

## Patterns

- Puzzles are flat arrays indexed row by row: square (row, col) is `row * size + col`. The grid rules in
  `frontend/src/lib/crossword.ts` are mirrored in `backend/src/lib/crossword.js`. Change both together.
- The answer key never reaches a solver's browser. Checking and revealing go through
  `POST /users/me/solver/:id/check` and `/reveal`.
- API routes live under `/auth`, `/users` and `/email`, and only touch the logged-in user's own rows
  (`/users/me/...`). Writes need the `X-Requested-With` header as a CSRF guard; `apiRequest()` adds it.
- Auth is session-only (the `connect.sid` cookie). No tokens in the browser.
- Routes throw `HttpError(status, message)`; Express 5 forwards async errors. Error messages are shown to
  people as they are, so write them for people.
- Grid state changes go through `crosswordReducer`. Components never mutate grid arrays.
- New logic ships with tests in the same change. Frontend tests find elements by role and accessible name.
- Comments explain why and state constraints. They don't narrate history.

## Design

The look comes from the crossword grid. The landing page is the reference.

- Graph-paper page background, white cards with a 3px black border and a hard offset shadow
  (`shadow-card`), square corners everywhere.
- Buttons are square tiles that press in: `.fancyButton`, or `BUTTON_PRIMARY` and `BUTTON_SECONDARY` from
  `Common/styles.ts`.
- Yellow (`bg-cursor`) marks where you are: the selected square, the current page, the focused field. Blue
  (`blue-200`) marks what goes with it, like the rest of the active word.
- The hard shadows and black borders are deliberate. They depart from the refactoring-ui skill's
  soft-shadow and fewer-borders advice on purpose, so don't "fix" them. The rest of that skill applies.
- Global rules apply here too: no colored border on a single edge, and no em dashes in user-facing copy.

## Working in this repo

- Never commit to `main`. Work on a branch; muuscodes opens pull requests on GitHub.
- Commit as `Muuscodes <muuscodes@gmail.com>`, not the machine's global git identity. Messages follow
  `type(scope): summary`.
- Record notable changes in `CHANGELOG.md`, newest first.
- Secrets live in `backend/.env` (gitignored). `backend/.env.example` holds placeholders only.
- `.claude/` (the starter kit's commands and skills) stays local and is gitignored.
- There is no tracked backlog. The owner's personal notes live in `frontend/notes.txt` (gitignored).
- Feedback from the Feedback page goes to crossword.crew.team@gmail.com unless `FEEDBACK_EMAIL` says
  otherwise.
