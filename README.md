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
    <a href="https://crossword_crew.app" target="_blank" rel="noreferrer"><strong>Open the App</strong></a>
    <br />
    <br />
    <a href="https://github.com/muuscodes/crossword_crew/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/muuscodes/crossword_crew/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

## About The Project

Crossword Crew is a web app for quickly and simply constructing, sharing, and
playing dense New York Times-style crossword puzzles.

### Built With

- [![React][React.js]][React-url]
- [![Typescript][Typescript]][Typescript-url]
- [![Tailwind][Tailwind]][Tailwind-url]
- [![Node.js][Node.js]][Node-url]
- [![PostgreSQL][PostgreSQL]][PostgreSQL-url]

## Getting Started

You can run Crossword Crew locally with the following instructions.

### Prerequisites

- [npm][npm-install-url]
- [PostgreSQL][PostgresQL-url]

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/muuscodes/crossword_crew.git
   ```
2. Install packages
   ```sh
   npm install
   ```
3. Change directory to /backend
   ```sh
   cd backend
   ```
4. Create a .env in /backend and populate the following:
   ```sh
   PORT=<your_desired_port>
   DB_USER=<your_database_username>
   DB_ENCRYPTED_PASSWORD=<your_database_password>
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=<your_database_name>
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   GOOGLE_CALLBACK_URI=<your_google_callback_uri>
   JWT_SECRET=<your_jwt_secret>
   SESSION_SECRET=<your_session_secret>
   EMAIL_USER=<your_email_account>
   EMAIL_APP_PASS=<your_email_account_password>
   ```
5. Set Up the Database

- Create a PostgreSQL database using the name specified in the .env file and run the following commands to set up your database:

```sh
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_library (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    crossword_grid_id INTEGER,
    solver_grid_id INTEGER
);

CREATE TABLE crossword_grids (
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

CREATE TABLE solver_grids (
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

CREATE TABLE session (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL,
    created TIMESTAMP(6) NOT NULL DEFAULT now(),
    modified TIMESTAMP(6) NOT NULL DEFAULT now()
);
```

5. Google Oauth Credentials

- Head over to [Google Cloud][google-cloud-url] and create a new project using Oauth

6. Email Setup

- Ensure that your email credentials in the .env allow for a local server to login

- If using Gmail, you can set up an app password by logging in and going to security and searching "App Passwords". Keep in mind, you have to turn on 2-Step-Verification to use app passwords

7. You're ready to go! Start the dev server like this:

   ```sh
   npm start
   ```

   After a few moments, you should be able to interact with crossword_crew locally
   at [http://localhost:3000](http://localhost:3000).

## Contributing

Contributions are what make the open source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

If you have a suggestion that would make this better, please fork the repo and
create a pull request. Don't forget to give the project a star. Thanks again!

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Tailwind]: https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Node.js]: https://img.shields.io/badge/Node.js-8CC84B?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[npm-install-url]: https://docs.npmjs.com/cli/v9/configuring-npm/install?v=true
[google-cloud-url]: https://console.cloud.google.com/
