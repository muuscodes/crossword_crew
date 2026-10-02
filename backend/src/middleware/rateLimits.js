import { rateLimit } from "express-rate-limit";

const MINUTE = 60 * 1000;

function limiter({ message, ...options }) {
  return rateLimit({
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message },
    ...options,
  });
}

const passThrough = (req, res, next) => next();

export function createRateLimiters({ enabled = true } = {}) {
  if (!enabled) {
    return { login: passThrough, signup: passThrough, email: passThrough };
  }
  return {
    login: limiter({
      windowMs: 5 * MINUTE,
      limit: 5,
      skipSuccessfulRequests: true,
      message: "Too many failed login attempts. Please try again in 5 minutes.",
    }),
    // Every sign-up sends a welcome email, so this also stops the form being used to spam inboxes.
    signup: limiter({
      windowMs: 60 * MINUTE,
      limit: 10,
      message: "Too many accounts created from this network. Please try again later.",
    }),
    email: limiter({
      windowMs: 60 * MINUTE,
      limit: 30,
      message: "Too many emails sent. Please try again later.",
    }),
  };
}
