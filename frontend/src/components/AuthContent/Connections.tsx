import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { apiRequest, errorMessage } from "../../lib/api";
import PageHeader from "../Common/PageHeader";
import PageMessage from "../Common/PageMessage";
import StatusMessage, { type Status } from "../Common/StatusMessage";
import { BUTTON_PRIMARY, CARD, CARD_HEADER, INPUT } from "../Common/styles";
import UserSearch from "../Common/UserSearch";
import type { Connection, CreatedPuzzle, LibraryResponse } from "../utils/types";



const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

interface PageData {
  connections: Connection[];
  puzzles: CreatedPuzzle[];
}

// The people the user has traded puzzles with, and a form to send one of their puzzles to anyone.
export default function Connections() {
  const [data, setData] = useState<PageData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [gridId, setGridId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [sending, setSending] = useState(false);
  const puzzleRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiRequest<{ connections: Connection[] }>("/users/me/connections"),
      apiRequest<LibraryResponse>("/users/me/grids"),
    ])
      .then(([{ connections }, library]) => {
        if (!cancelled) setData({ connections, puzzles: library.created });
      })
      .catch((error) => {
        if (!cancelled) setLoadError(errorMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const recipientUsername = recipient.trim();
    if (!gridId) {
      setStatus({ tone: "error", text: "Choose one of your puzzles to send." });
      return;
    }
    if (!recipientUsername) {
      setStatus({ tone: "error", text: "Choose who to send it to." });
      return;
    }
    setSending(true);
    setStatus(null);
    try {
      const result = await apiRequest<{ message: string }>(`/users/me/grids/${gridId}/share`, {
        method: "POST",
        body: { recipientUsername },
      });
      setStatus({ tone: "success", text: result.message });
      setRecipient("");
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setStatus({ tone: "error", text: errorMessage(error) });
    } finally {
      setSending(false);
    }
  };

  const sendTo = (username: string) => {
    setRecipient(username);
    setStatus(null);
    puzzleRef.current?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    puzzleRef.current?.focus();
  };

  if (loadError) return <PageMessage>{loadError}</PageMessage>;
  if (!data) return <PageMessage>Loading your connections…</PageMessage>;

  const canSend = data.puzzles.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 md:py-14">
      <PageHeader label="Your crew" title="Connections">
        <p>Everyone you've traded puzzles with, and a quick way to send them another one.</p>
      </PageHeader>

      <section aria-labelledby="send-heading" className={CARD}>
        <h2 id="send-heading" className={CARD_HEADER}>
          Send a puzzle
        </h2>
        {canSend ? (
          <form onSubmit={send} aria-busy={sending} className="flex flex-col gap-3 p-5 text-left sm:p-6">
            <label htmlFor="send-puzzle" className="text-lg font-bold">
              Puzzle
            </label>
            <select
              id="send-puzzle"
              ref={puzzleRef}
              value={gridId}
              onChange={(event) => setGridId(event.target.value)}
              className={`${INPUT} select-chevron cursor-pointer`}
            >
              <option value="">Choose one of your puzzles</option>
              {data.puzzles.map((puzzle) => (
                <option key={puzzle.grid_id} value={puzzle.grid_id}>
                  {puzzle.puzzle_title || "Crossword Puzzle"}
                </option>
              ))}
            </select>
            <label htmlFor="send-recipient" className="mt-2 text-lg font-bold">
              Send to
            </label>
            <UserSearch id="send-recipient" value={recipient} onChange={setRecipient} disabled={sending} />
            <p className="border-2 border-black bg-cursor px-3 py-2 text-base">
              Once a puzzle is shared, it can no longer be edited.
            </p>
            <StatusMessage status={status} />
            <button type="submit" className={`${BUTTON_PRIMARY} self-start`} disabled={sending}>
              {sending ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Sending…
                </>
              ) : (
                "Send"
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 p-6 text-center text-xl">
            <p>You haven't made any puzzles to send yet.</p>
            <Link to="/create" className={BUTTON_PRIMARY}>
              Create a puzzle
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="connections-heading">
        <h2 id="connections-heading" className="mb-5 text-3xl font-extrabold tracking-tight">
          Your connections
        </h2>
        {data.connections.length === 0 ? (
          <p className={`${CARD} p-6 text-xl`}>
            No connections yet. Send someone a puzzle, or ask a friend to send you one.
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {data.connections.map((connection) => (
              <li
                key={connection.username}
                className={`${CARD} flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5`}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black bg-blue-200 text-2xl font-extrabold"
                  >
                    {[...connection.username][0]?.toLocaleUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="break-words text-2xl font-extrabold">{connection.username}</p>
                    <p className="text-lg">
                      You sent {count(connection.sent, "puzzle")}. They sent you{" "}
                      {count(connection.received, "puzzle")}.
                    </p>
                    <p className="text-neutral-600">
                      Last shared {format(new Date(connection.last_shared_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                {canSend && (
                  <button
                    type="button"
                    className="fancyButton"
                    aria-label={`Send a puzzle to ${connection.username}`}
                    onClick={() => sendTo(connection.username)}
                  >
                    Send a puzzle
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
