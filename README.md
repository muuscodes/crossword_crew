<!-- README adapted from https://github.com/othneildrew/Best-README-Template -->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/muuscodes/crossword_crew">
  <div style="border: 5px solid white;">
    <img src="./frontend/src/img/favicon.jpg" alt="Logo" width="80" height="80" >
    </div>
  </a>

<h3 align="center">Crossword Crew</h3>

  <p align="center">
    The perfect space to create, share, and play crosswords with your friends!
    <br />
    <a href="https://www.crosswordcrew.com" target="_blank" rel="noreferrer"><strong>Play now</strong></a>
    <br />
    <br />
    <a href="https://github.com/muuscodes/crossword_crew/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/muuscodes/crossword_crew/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

## About The Project

Crossword Crew is a social web app for quickly and simply constructing, sharing, and
playing dense New York Times-style crossword puzzles.

### Built With

- [![React][React.js]][React-url]
- [![Typescript][Typescript]][Typescript-url]
- [![Tailwind][Tailwind]][Tailwind-url]
- [![Vite][ViteLogo]][ViteLogo-url]
- [![Node.js][Node.js]][Node-url]
- [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
- [![Docker][DockerLogo]][DockerLogo-url]

## Getting Started

If you want to play around without getting your hands dirty, go to the [website][website-url] and make an account.

You can also run Crossword Crew yourself.

### Prerequisites

- [Docker Desktop][docker-url], which includes Docker Compose. Make sure it's running.
- [Node.js 24][node-download-url] (see `.nvmrc`), only needed for local development and running the tests.

### Run it with Docker

1. Clone the repo

   ```sh
   git clone https://github.com/muuscodes/crossword_crew.git
   cd crossword_crew
   ```

2. Create your environment file from the template, then open `backend/.env` and fill it in

   ```sh
   cp backend/.env.example backend/.env
   ```

   At minimum, set `SESSION_SECRET` and the database passwords. Keep `DB_USER`, `DB_PASSWORD` and `DB_NAME`
   equal to `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_DB`. See [Environment variables](#environment-variables)
   for everything else. Never commit `backend/.env`.

3. (Optional) Google sign-in

   - In [Google Cloud][google-cloud-url], create an OAuth client.
   - Set the Authorized JavaScript origin to `http://localhost:3000`.
   - Set the Authorized redirect URI to `http://localhost:3000/auth/google/redirect`.
   - Put the client id, secret and that redirect URI in the `GOOGLE_*` variables.

   Without these, the "Sign in with Google" button explains that it isn't set up.

4. (Optional) Email

   Welcome, sharing and feedback emails go out through a Gmail account. Turn on 2-Step Verification for the
   account, create an app password (search "App Passwords" in your Google account's security settings), and put
   the address and app password in `EMAIL_USER` and `EMAIL_APP_PASS`. Without them the app works but sends no email.
   Bug reports, ideas and comments from the Feedback page go to crossword.crew.team@gmail.com; set `FEEDBACK_EMAIL`
   to send them somewhere else.

5. Start everything

   ```sh
   docker compose up --build
   ```

   The database schema is created or upgraded automatically on start. After a few moments, Crossword Crew is
   running at [http://localhost:3000](http://localhost:3000).

- Press `Ctrl + C` (or run `docker compose down`) to stop. Your data stays in the `pgdata` volume.
- After changing the code, run `docker compose up --build` again to rebuild.
- `docker compose down -v` also **deletes the database**. Only use it when you want to start over.

### Local development

For hot reloading, run the database in Docker and the app on your machine:

```sh
docker compose up -d db          # Postgres on localhost:5433

cd backend
npm install
npm run migrate
npm run dev                      # API on http://localhost:3000, restarts on changes

cd ../frontend                   # in a second terminal
npm install
npm run dev                      # app on http://localhost:5173
```

The Vite dev server forwards `/auth`, `/users` and `/email` requests to the backend. Google sign-in returns
to the redirect URI you configured (port 3000), which serves the last `npm run build` of the frontend.

### Tests

```sh
cd backend && npm test           # API tests against an in-memory Postgres (PGlite), no database needed
cd frontend && npm test          # component and logic tests
cd frontend && npm run lint      # ESLint
cd frontend && npm run build     # type-check and production build
```

## Environment variables

All of these live in `backend/.env`. `backend/.env.example` has the full list with placeholders.

| Variable | Required | What it does |
| --- | --- | --- |
| `SESSION_SECRET` | Yes | Long random string that signs session cookies. |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Yes | How the backend reaches Postgres. Docker Compose sets `DB_HOST=db` and `DB_PORT=5432` for the app container; use `localhost` and `5433` when running the backend on your machine. |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | Yes, with Docker | Used by the Postgres container to create the database. |
| `PORT` | No | Port for the backend (default 3000). |
| `NODE_ENV` | No | Set to `production` in production. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URI` | No | Google sign-in. All three are needed to turn it on. |
| `EMAIL_USER`, `EMAIL_APP_PASS` | No | Gmail address and app password for outgoing email. |
| `FEEDBACK_EMAIL` | No | Where messages from the Feedback page (bugs, ideas and comments) go. Defaults to `crossword.crew.team@gmail.com`. |
| `WELCOME_GRID_ID` | No | Puzzle copied into every new account (default `1`). Use `none` to turn it off. |
| `TRUST_PROXY` | No | Number of reverse proxies in front of the app. Defaults to `1` when `NODE_ENV=production` and off otherwise. |

## Database migrations

The schema lives in `backend/migrations/*.sql`. Each file runs once, in order, and is recorded in the
`schema_migrations` table. The Docker image runs pending migrations every time it starts. Outside Docker, run
`npm run migrate` in `backend`; the server refuses to start while migrations are pending.

### Upgrading an existing database

Databases created before migrations existed (by the old `backend/initdb/init.sql`) are upgraded in place.
Back up first:

```sh
docker compose exec db pg_dump -U <POSTGRES_USER> <POSTGRES_DB> > backup.sql
```

Migration `002_integrity_constraints.sql` then:

- removes duplicate copies of a puzzle that was shared with the same person more than once,
- renames Google accounts whose display name clashes with another account (by adding " 2", " 3", and so on),
  so usernames can be unique,
- adds the missing primary keys, foreign keys, unique constraints and indexes.

If two password accounts share a username, the migration stops without changing anything and asks you to rename
one of them. The `user_library` table is no longer used; drop it once you're happy with the upgrade.

## Welcome crossword

New accounts get a copy of the puzzle whose id is `WELCOME_GRID_ID` (by default `1`, the first puzzle the first
user creates). If that puzzle doesn't exist yet, sign-up simply skips it. Set `WELCOME_GRID_ID=none` to turn the
feature off.

## Deploying

- Serve the app over HTTPS. Session cookies are marked secure automatically when requests arrive over HTTPS.
- Behind a reverse proxy, keep `TRUST_PROXY` at `1` (the production default) so rate limits and secure cookies
  see the real client. If nothing sits in front of the app, set `TRUST_PROXY=false`.
- Keep secrets in your host's secret manager or `backend/.env`, never in the repository.

## Contributing

Contributions are what make the open source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

If you have a suggestion that would make this better, please fork the repo and
create a pull request. Don't forget to give the project a star. Thanks again!

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

## Acknowledgments

- [The New York Times Crossword][nyt-url]
- [Shoutout to my mentor, Shelton Carr][shelton-url]
- [A great crossword inspiration app][crosswyrd-url]
- [Font Awesome][font-awesome-url]
- [Libre Franklin][libre-franklin-url], the site's typeface (SIL Open Font License)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Tailwind]: https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Node.js]: https://img.shields.io/badge/Node.js-8CC84B?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[DockerLogo]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[DockerLogo-url]: https://www.docker.com/
[ViteLogo]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[ViteLogo-url]: https://vite.dev/
[docker-url]: https://docs.docker.com/get-docker/
[node-download-url]: https://nodejs.org/en/download
[google-cloud-url]: https://console.cloud.google.com/
[nyt-url]: https://www.nytimes.com/crosswords
[crosswyrd-url]: https://crosswyrd.app/
[shelton-url]: https://github.com/sheltoncarr
[font-awesome-url]: https://fontawesome.com/
[libre-franklin-url]: https://github.com/impallari/Libre-Franklin
[website-url]: https://www.crosswordcrew.com
