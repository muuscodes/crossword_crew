import { useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router";
import ErrorBoundary from "../Common/ErrorBoundary";
import Modal from "../Common/Modal";
import Authentication, { type AuthMode } from "../NonAuthContent/Authentication";
import type { LayoutContext } from "./authDialog";
import Footer from "./Footer";
import Navbar from "./Navbar";

// Messages for the ?login= codes the backend adds when Google sign-in doesn't complete.
const LOGIN_ERRORS: Partial<Record<string, string>> = {
  failed: "Google sign-in didn't work. Please try again.",
  "email-in-use":
    "That email address already belongs to an account with a password. Log in with your username and password instead.",
  "google-unavailable": "Google sign-in isn't set up on this server.",
};

export default function Layout() {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const loginError = LOGIN_ERRORS[searchParams.get("login") ?? ""] ?? null;
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const openMode = authMode ?? (loginError ? "login" : null);

  const closeAuth = () => {
    setAuthMode(null);
    if (searchParams.has("login")) {
      const remaining = new URLSearchParams(searchParams);
      remaining.delete("login");
      setSearchParams(remaining, { replace: true });
    }
  };

  // The main area grows so the footer stays at the bottom of short pages.
  return (
    <div className="flex min-h-screen flex-col">
      {openMode && (
        <Modal label="Log in or sign up" onClose={closeAuth}>
          <Authentication key={openMode} initialMode={openMode} onClose={closeAuth} initialError={loginError} />
        </Modal>
      )}
      <Navbar onLogIn={() => setAuthMode("login")} onSignUp={() => setAuthMode("signup")} />
      <main className="graph-paper flex-1">
        {/* Keyed by page, so moving to another page clears a crash. */}
        <ErrorBoundary key={pathname}>
          <Outlet context={{ openAuth: setAuthMode } satisfies LayoutContext} />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
