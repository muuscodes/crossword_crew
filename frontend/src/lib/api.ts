export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const GENERIC_ERROR = "Something went wrong. Please try again.";

// Called whenever the server says the session has ended, so the app can send the person back to
// the landing page instead of showing a broken screen.
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedListener(listener: (() => void) | null) {
  onUnauthorized = listener;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}

// JSON request to the backend. The session cookie rides along automatically, and the
// X-Requested-With header is what the server checks to block cross-site requests.
export async function apiRequest<T>(path: string, { method = "GET", body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Couldn't reach the server. Check your connection and try again.", 0);
  }

  const data: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.();
    const message =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : GENERIC_ERROR;
    throw new ApiError(message, response.status);
  }
  return data as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : GENERIC_ERROR;
}

// True when the server says a puzzle doesn't exist or belongs to someone else. It answers "not
// found" either way, so nobody can tell other people's puzzle ids apart from missing ones.
export function isNotYours(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 400 || error.status === 403 || error.status === 404);
}
