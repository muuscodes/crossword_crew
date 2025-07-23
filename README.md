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
- [![Vite][ViteLogo]][ViteLogo-url]
- [![Node.js][Node.js]][Node-url]
- [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
- [![Docker][DockerLogo]][DockerLogo-url]

## Getting Started

You can run Crossword Crew locally with the following instructions.

### Prerequisites

- [Docker][docker-url] (Make sure Docker Desktop is installed and running)
- [Docker Compose][docker-compose-url] (Usually included with Docker Desktop)
- [npm][npm-install-url]
- [PostgreSQL][PostgresQL-url]

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/muuscodes/crossword_crew.git
   cd crossword_crew
   ```
2. Change directory to /backend
   ```sh
   cd backend
   ```
3. Create a `.env` in the `/backend` directory and populate it with the following:
   ```sh
   PORT=3000 or <your_desired_server_port>
   DB_USER=admin
   DB_PASSWORD=password
   DB_HOST=db
   DB_PORT=5433
   DB_NAME=crossword_crew
   POSTGRES_USER=admin
   POSTGRES_DB=crossword_crew
   POSTGRES_PASSWORD=password
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   GOOGLE_CALLBACK_URI=<your_google_callback_uri>
   JWT_SECRET=<your_jwt_secret>
   SESSION_SECRET=<your_session_secret>
   EMAIL_USER=<your_email_account>
   EMAIL_APP_PASS=<your_email_account_password>
   NODE_ENV=development
   ```

- Feel free to customize the database variables, just keep in mind that the following variables should be equated: `DB_USER` = `POSTGRES_USER`, `DB_PASSWORD` = `POSTGRES_PASSWORD`, `DB_NAME` = `POSTGRES_DB`. Also the Docker files use `PORT=3000` so be sure to update those if you use a different port

4. Google Oauth Credentials

- Head over to [Google Cloud][google-cloud-url] and create a new project using Oauth
- When creating a client, be sure to have your Authorized JavaScript origins set to:
  http://localhost:3000 (or ending in whatever port you specified in the .env file)
- Be sure to have the Authorized redirect URIs set to: http://localhost:3000/auth/google/redirect
  (also using you the same port)

6. Email Setup

- Ensure that your email credentials in the .env allow for a local server to login
- If using Gmail, you can set up an app password by logging in and going to security and searching "App Passwords". Keep in mind, you have to turn on 2-Step-Verification to use app passwords

7. You're ready to go! Start the application:

- Make sure that Docker Desktop is downloaded and running!

  ```sh
  cd .. // get back to the root directory
  docker-compose up
  ```

  After a few moments, you should be able to interact with crossword_crew locally
  at [http://localhost:3000](http://localhost:3000).

8. Welcome Crossword

- In the current configuration, the first crossword that the first user makes becomes a "welcome crossword"
  for all other users. Feel free to remove this feature in `/backend/src/routes/authRoutes.js`

# Notes

- If you make changes to the code, you can simply run `docker-compose down -v` and then `docker-compose up` again to see the changes reflected
- If you need to stop the application, you can do so by pressing `Ctrl + C` in the terminal where Docker is running

## Contributing

Contributions are what make the open source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

If you have a suggestion that would make this better, please fork the repo and
create a pull request. Don't forget to give the project a star. Thanks again!

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Acknowledgments

- [The New York Times Crossword][nyt-url]
- [Shoutout to my mentor, Shelton Carr][shelton-url]
- [A great crossword inspiration app][crosswyrd-url]
- [Font Awesome][font-awesome-url]

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
[DockerLogo]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[DockerLogo-url]: https://www.docker.com/
[ViteLogo]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[ViteLogo-url]: https://vitejs.dev/
[Docker-url]: https://docs.docker.com/get-docker/
[Docker-compose-url]: https://docs.docker.com/compose/install/
[npm-install-url]: https://docs.npmjs.com/cli/v9/configuring-npm/install?v=true
[google-cloud-url]: https://console.cloud.google.com/
[nyt-url]: https://www.nytimes.com/crosswords
[crosswyrd-url]: https://crosswyrd.app/
[shelton-url]: https://github.com/sheltoncarr
[font-awesome-url]: https://fontawesome.com/
