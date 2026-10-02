# Changelog

Notable changes, newest first.

## Unreleased

### Added

- Feedback page for bug reports, ideas and comments. Messages go to crossword.crew.team@gmail.com
  (`FEEDBACK_EMAIL` overrides) with the sender's account email as the reply-to address.
- Check and reveal in the solver, for a square, a word or the whole puzzle.
- A crossword keyboard for phones and tablets, so the device keyboard never pushes the page around.
- Connections page: everyone you've traded puzzles with, and username search for sharing.
- Settings page: change your username, email or password.
- A friendly error page instead of a blank screen when something crashes.
- Landing page with floating crossword pieces that move away from the pointer, and hands-on demos of
  building a grid, writing clues, sharing and solving.
- GitHub Actions CI running lint, tests and the build for both halves of the app.

### Changed

- Rebuilt the backend on Express 5 with server sessions, SQL migrations, input validation, rate limits and
  a test suite that runs on PGlite.
- Rebuilt the frontend around one crossword engine shared by Create, Edit and Solve.
- New look across the whole app: graph paper, crossword-tile cards and buttons, Libre Franklin, and a new
  "CC" icon.
- Save buttons read "Saved" until there's something new to save.
- Opening a puzzle that isn't yours sends you home with a note.
- Extra spaces in clues and titles are tidied automatically.
- Contact is now Feedback, and `/contact` redirects there.
- The Docker image runs on Node 24 and applies migrations before starting.

### Fixed

- Arrow keys now wrap from one end of the grid to the other when the corner squares are black.
- Switching between a square's across and down clues moves the highlight.
- Placing black squares has a visible cursor and works from the keyboard.

### Security

- Replaced tokens kept in the browser's local storage with server sessions, and writes need a CSRF header.
- Removed the open user lookup that returned other people's account details.
- Solvers never receive the answer key, and puzzles are only readable by their owner and recipients.
- Login, sign-up and email sending are rate limited, and emails escape user input.

### Removed

- The old Create, Edit and Solve components, and images the new landing page no longer uses.
