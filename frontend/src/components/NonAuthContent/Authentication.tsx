import { faEye, faEyeSlash, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type FormEvent, type ReactNode, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/auth";
import googleLogo from "../../img/GoogleLogo.png";
import { errorMessage } from "../../lib/api";
import { BUTTON_PRIMARY, CHIP_YELLOW, INPUT } from "../Common/styles";

export type AuthMode = "login" | "signup";

const COPY: Record<AuthMode, { title: string; subtitle: string; submit: string }> = {
  login: { title: "Welcome back", subtitle: "Log in to keep puzzling.", submit: "Log in" },
  signup: {
    title: "Create your account",
    subtitle: "Make crosswords and share them with friends.",
    submit: "Create account",
  },
};

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-neutral-600">{hint}</p>}
    </div>
  );
}

interface AuthenticationProps {
  onClose: () => void;
  initialMode?: AuthMode;
  initialError?: string | null;
}

export default function Authentication({ onClose, initialMode = "login", initialError = null }: AuthenticationProps) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState<string | null>(initialError);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isSignUp = mode === "signup";
  const copy = COPY[mode];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "");
    setSubmitting(true);
    setError(null);
    try {
      if (isSignUp) await signup(field("email").trim(), field("username").trim(), field("password"));
      else await login(field("username").trim(), field("password"));
      // Go back to the page that asked for a login, if there was one.
      const from = (location.state as { from?: string } | null)?.from;
      onClose();
      navigate(from ?? "/home", { replace: true });
    } catch (submitError) {
      setError(errorMessage(submitError));
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(isSignUp ? "login" : "signup");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={CHIP_YELLOW}>{isSignUp ? "Sign up" : "Log in"}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{copy.title}</h2>
          <p className="mt-1 text-neutral-600">{copy.subtitle}</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border-2 border-transparent text-xl hover:border-black hover:bg-cursor"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>

      <a
        href="/auth/google"
        className="flex items-center justify-center gap-3 border-2 border-black bg-white px-4 py-2.5 font-bold shadow-tile transition hover:translate-x-px hover:translate-y-px hover:bg-yellow-50 hover:shadow-[2px_2px_0_0_#000]"
      >
        <img src={googleLogo} alt="" className="h-5 w-5" />
        Continue with Google
      </a>

      <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-neutral-600">
        <span aria-hidden="true" className="h-0.5 flex-1 bg-black" />
        or
        <span aria-hidden="true" className="h-0.5 flex-1 bg-black" />
      </div>

      {error && (
        <p role="alert" className="border-2 border-red-700 bg-red-50 px-3 py-2 text-red-800">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id="auth-username" label="Username">
          <input
            id="auth-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            maxLength={50}
            className={INPUT}
            data-autofocus
          />
        </Field>
        {isSignUp && (
          <Field id="auth-email" label="Email">
            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={100}
              className={INPUT}
            />
          </Field>
        )}
        <Field id="auth-password" label="Password" hint={isSignUp ? "At least 6 characters." : undefined}>
          <div className="relative">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              required
              minLength={isSignUp ? 6 : undefined}
              maxLength={72}
              className={`${INPUT} pr-12`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center text-neutral-500 hover:text-black"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
        </Field>
        <button type="submit" className={`${BUTTON_PRIMARY} mt-1 w-full`} disabled={submitting}>
          {submitting ? "Please wait…" : copy.submit}
        </button>
      </form>

      <p className="text-center text-neutral-600">
        {isSignUp ? "Already have an account?" : "New to Crossword Crew?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          className="cursor-pointer font-bold text-black underline underline-offset-2 hover:no-underline"
        >
          {isSignUp ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
