const DEFAULT_PORT = 3000;
// The team inbox for messages from the Feedback page. FEEDBACK_EMAIL overrides it.
export const DEFAULT_FEEDBACK_EMAIL = "crossword.crew.team@gmail.com";

// Express "trust proxy" setting. Behind one reverse proxy (the usual production setup) it must be 1
// so rate limits and secure cookies see the real client. Without a proxy it must stay off, or anyone
// could spoof X-Forwarded-For to dodge the login rate limit.
export function parseTrustProxy(value, isProduction) {
  if (value === undefined || value === "") return isProduction ? 1 : false;
  if (value === "true") return true;
  if (value === "false") return false;
  const hops = Number(value);
  return Number.isInteger(hops) ? hops : value;
}

// The puzzle copied into every new account. "none" turns the feature off.
export function parseWelcomeGridId(value) {
  if (value === undefined || value === "") return 1;
  if (value === "none") return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('WELCOME_GRID_ID must be a positive whole number or "none"');
  }
  return id;
}

export function dbConfigFromEnv(env = process.env) {
  return {
    host: env.DB_HOST || "localhost",
    port: Number(env.DB_PORT) || 5432,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  };
}

export function loadConfig(env = process.env) {
  if (!env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is not set. Copy backend/.env.example to backend/.env and fill it in.");
  }
  const isProduction = env.NODE_ENV === "production";
  const google =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URI
      ? {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URI,
        }
      : null;
  const email =
    env.EMAIL_USER && env.EMAIL_APP_PASS ? { user: env.EMAIL_USER, pass: env.EMAIL_APP_PASS } : null;

  return {
    isProduction,
    port: Number(env.PORT) || DEFAULT_PORT,
    sessionSecret: env.SESSION_SECRET,
    trustProxy: parseTrustProxy(env.TRUST_PROXY, isProduction),
    db: dbConfigFromEnv(env),
    google,
    email,
    feedbackEmail: env.FEEDBACK_EMAIL?.trim() || DEFAULT_FEEDBACK_EMAIL,
    welcomeGridId: parseWelcomeGridId(env.WELCOME_GRID_ID),
  };
}
