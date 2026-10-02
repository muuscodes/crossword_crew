// An error whose message is safe to show the user, sent with the given HTTP status.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.expose = true;
  }
}

// Postgres error code for a unique constraint violation.
export const UNIQUE_VIOLATION = "23505";

// Logs a failed background task (like sending an email) instead of crashing the request.
export function runInBackground(promise, label) {
  promise.catch((error) => console.error(`Failed to send ${label}:`, error));
}
