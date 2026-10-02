import path from "node:path";
import express from "express";
import session from "express-session";
import { Passport } from "passport";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "./lib/session.js";
import { requireApiHeader, requireAuth } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { createRateLimiters } from "./middleware/rateLimits.js";
import { createAccountRouter } from "./routes/accountRoutes.js";
import { createAuthRouter } from "./routes/authRoutes.js";
import { createEmailRouter } from "./routes/emailRoutes.js";
import { createGridRouter } from "./routes/gridRoutes.js";
import { createPeopleRouter } from "./routes/peopleRoutes.js";

const API_PREFIXES = ["/auth", "/users", "/email"];

// Serves index.html for every page route so the React router can take over. A visitor who
// cancels the request mid-download is not an error worth reporting.
export function spaFallback(indexFile) {
  return (req, res, next) => {
    res.sendFile(indexFile, { headers: { "Cache-Control": "no-cache" } }, (error) => {
      if (!error || error.code === "ECONNABORTED" || res.headersSent) return;
      if (error.code === "ENOENT") {
        res
          .status(404)
          .type("text")
          .send("The frontend hasn't been built. Run `npm run build` in the frontend folder.");
        return;
      }
      next(error);
    });
  };
}

// Builds the Express app. Everything it talks to is passed in, so tests can use an in-memory
// database, a stub mailer and an in-memory session store.
export function createApp({ db, mailer, config, sessionStore, staticDir, rateLimiting = true }) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);

  if (staticDir) {
    // Vite fingerprints everything in /assets, so browsers can cache it forever. A missing asset
    // gets a 404 instead of falling through to index.html.
    app.use(
      "/assets",
      express.static(path.join(staticDir, "assets"), {
        immutable: true,
        maxAge: "1y",
        fallthrough: false,
      }),
    );
    app.use(express.static(staticDir, { index: false }));
  }

  // Sessions are only loaded for API requests, so static files never touch the database.
  const passport = new Passport();
  app.use(
    API_PREFIXES,
    express.json({ limit: "100kb" }),
    session({
      name: SESSION_COOKIE,
      store: sessionStore,
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        // Secure whenever the request arrived over HTTPS (behind a proxy, this needs TRUST_PROXY).
        secure: "auto",
        maxAge: SESSION_MAX_AGE,
      },
    }),
    passport.initialize(),
    passport.session(),
    requireApiHeader,
  );

  const limiters = createRateLimiters({ enabled: rateLimiting });
  app.use("/auth", createAuthRouter({ db, mailer, config, passport, limiters }));
  app.use("/users/me/account", requireAuth, createAccountRouter({ db }));
  app.use(
    "/users",
    requireAuth,
    createGridRouter({ db, mailer, limiters }),
    createPeopleRouter({ db, config }),
  );
  app.use("/email", createEmailRouter({ db, mailer, limiters }));
  app.use(API_PREFIXES, notFound);

  if (staticDir) {
    app.get("/{*path}", spaFallback(path.join(staticDir, "index.html")));
  }
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
