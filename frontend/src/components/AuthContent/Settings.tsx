import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { useAuth } from "../../context/auth";
import { apiRequest, errorMessage } from "../../lib/api";
import PageHeader from "../Common/PageHeader";
import PageMessage from "../Common/PageMessage";
import StatusMessage, { type Status } from "../Common/StatusMessage";
import { BUTTON_PRIMARY, CARD, CARD_HEADER, INPUT } from "../Common/styles";
import type { Account, User } from "../utils/types";

const FIELD = INPUT;
const SAVE_BUTTON = `${BUTTON_PRIMARY} mt-2 self-start`;

function SettingsSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={CARD}>
      <h2 id={id} className={CARD_HEADER}>
        {title}
      </h2>
      <div className="flex flex-col gap-4 p-5 text-left text-lg sm:p-6 [&_label]:font-bold">{children}</div>
    </section>
  );
}

// Busy flag and result message for one settings form. The action returns the success message.
function useFormSubmit() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (action: () => Promise<string>) => {
    setBusy(true);
    setStatus(null);
    try {
      setStatus({ tone: "success", text: await action() });
    } catch (error) {
      setStatus({ tone: "error", text: errorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const fail = (text: string) => setStatus({ tone: "error", text });
  return { status, busy, submit, fail };
}

function UsernameSettings({ account, onSaved }: { account: Account; onSaved: (user: User) => void }) {
  const [username, setUsername] = useState(account.username);
  const { status, busy, submit, fail } = useFormSubmit();

  const save = (event: FormEvent) => {
    event.preventDefault();
    const newUsername = username.trim();
    if (!newUsername) return fail("Enter a username.");
    if (newUsername === account.username) return fail("That's already your username.");
    void submit(async () => {
      const { user } = await apiRequest<{ user: User }>("/users/me/account/username", {
        method: "PATCH",
        body: { username: newUsername },
      });
      onSaved(user);
      setUsername(user.username);
      return `Your username is now ${user.username}.`;
    });
  };

  return (
    <SettingsSection id="username-heading" title="Username">
      <p>
        Your username is <strong>{account.username}</strong>. Friends use it to share puzzles with you
        {account.has_password ? ", and you use it to log in" : ""}.
      </p>
      <form onSubmit={save} className="flex flex-col gap-2">
        <label htmlFor="settings-username">New username</label>
        <input
          id="settings-username"
          type="text"
          autoComplete="username"
          required
          maxLength={50}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className={FIELD}
        />
        <StatusMessage status={status} />
        <button type="submit" className={SAVE_BUTTON} disabled={busy}>
          {busy ? "Saving…" : "Save username"}
        </button>
      </form>
    </SettingsSection>
  );
}

function EmailSettings({ account, onSaved }: { account: Account; onSaved: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const { status, busy, submit, fail } = useFormSubmit();

  const save = (event: FormEvent) => {
    event.preventDefault();
    const newEmail = email.trim();
    if (!newEmail) return fail("Enter your new email address.");
    void submit(async () => {
      const result = await apiRequest<{ email: string }>("/users/me/account/email", {
        method: "PATCH",
        body: account.has_password ? { email: newEmail, currentPassword } : { email: newEmail },
      });
      onSaved(result.email);
      setEmail("");
      setCurrentPassword("");
      return `Your email is now ${result.email}.`;
    });
  };

  return (
    <SettingsSection id="email-heading" title="Email">
      <p>
        Your email is <strong>{account.email}</strong>. Welcome and sharing emails go here.
      </p>
      <form onSubmit={save} className="flex flex-col gap-2">
        <label htmlFor="settings-email">New email</label>
        <input
          id="settings-email"
          type="email"
          autoComplete="email"
          required
          maxLength={100}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={FIELD}
        />
        {account.has_password && (
          <>
            <label htmlFor="settings-email-password">Current password</label>
            <input
              id="settings-email-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className={FIELD}
            />
          </>
        )}
        <StatusMessage status={status} />
        <button type="submit" className={SAVE_BUTTON} disabled={busy}>
          {busy ? "Saving…" : "Save email"}
        </button>
      </form>
    </SettingsSection>
  );
}

function PasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { status, busy, submit, fail } = useFormSubmit();

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) return fail("New passwords need at least 6 characters.");
    if (newPassword !== confirmPassword) return fail("The new passwords don't match.");
    void submit(async () => {
      const result = await apiRequest<{ message: string }>("/users/me/account/password", {
        method: "PUT",
        body: { currentPassword, newPassword },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      return result.message;
    });
  };

  return (
    <SettingsSection id="password-heading" title="Password">
      <form onSubmit={save} className="flex flex-col gap-2">
        <label htmlFor="settings-current-password">Current password</label>
        <input
          id="settings-current-password"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className={FIELD}
        />
        <label htmlFor="settings-new-password">New password (6 or more characters)</label>
        <input
          id="settings-new-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          maxLength={72}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className={FIELD}
        />
        <label htmlFor="settings-confirm-password">Confirm new password</label>
        <input
          id="settings-confirm-password"
          type="password"
          autoComplete="new-password"
          required
          maxLength={72}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={FIELD}
        />
        <StatusMessage status={status} />
        <button type="submit" className={SAVE_BUTTON} disabled={busy}>
          {busy ? "Saving…" : "Change password"}
        </button>
      </form>
    </SettingsSection>
  );
}

export default function Settings() {
  const { updateUser } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest<Account>("/users/me/account")
      .then((result) => {
        if (!cancelled) setAccount(result);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(errorMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) return <PageMessage>{loadError}</PageMessage>;
  if (!account) return <PageMessage>Loading your settings…</PageMessage>;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14">
      <PageHeader label="Your account" title="Settings">
        <p>Change your username, email or password.</p>
      </PageHeader>
      <UsernameSettings
        account={account}
        onSaved={(user) => {
          setAccount({ ...account, username: user.username });
          updateUser(user);
        }}
      />
      <EmailSettings account={account} onSaved={(email) => setAccount({ ...account, email })} />
      {account.has_password ? (
        <PasswordSettings />
      ) : (
        <SettingsSection id="password-heading" title="Password">
          <p>You sign in with Google, so this account doesn't have a password to change.</p>
        </SettingsSection>
      )}
    </div>
  );
}
