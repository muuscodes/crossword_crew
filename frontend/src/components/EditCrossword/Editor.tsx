import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router";
import { ApiError, apiRequest, errorMessage, isNotYours } from "../../lib/api";
import { puzzlePayload, puzzleProblems } from "../../lib/crossword";
import { puzzleGridFromRecord, useCrossword } from "../../lib/useCrossword";
import Announcement from "../Common/Announcement";
import ConfirmDialog from "../Common/ConfirmDialog";
import PageHeader from "../Common/PageHeader";
import PageMessage from "../Common/PageMessage";
import SaveButton from "../Common/SaveButton";
import StatusMessage, { type Status } from "../Common/StatusMessage";
import UserSearch from "../Common/UserSearch";
import PuzzleWorkspace from "../Crossword/PuzzleWorkspace";
import type { EditorPuzzle } from "../utils/types";

type LoadState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "notYours" }
  | { status: "error"; message: string };
type Busy = "saving" | "deleting" | "sharing" | null;

// Keyed by puzzle id, so moving to another puzzle starts from a clean slate.
export default function Editor() {
  const { gridId = "" } = useParams();
  return <PuzzleEditor key={gridId} gridId={gridId} />;
}

function PuzzleEditor({ gridId }: { gridId: string }) {
  const crossword = useCrossword();
  const { state, dispatch } = crossword;
  const location = useLocation();
  const navigate = useNavigate();
  const arrivedFromSave = Boolean((location.state as { saved?: boolean } | null)?.saved);

  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [title, setTitle] = useState("");
  const [savedTitle, setSavedTitle] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [announcement, setAnnouncement] = useState<"saved" | "shared" | null>(
    arrivedFromSave ? "saved" : null,
  );
  // Who the puzzle was just shared with, spelled the way their account spells it.
  const [sharedWith, setSharedWith] = useState("");
  const [confirm, setConfirm] = useState<"delete" | "clear" | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [shareStatus, setShareStatus] = useState<Status | null>(null);

  const dirty = state.dirty || title !== savedTitle;

  useEffect(() => {
    let cancelled = false;
    apiRequest<EditorPuzzle>(`/users/me/grids/${gridId}`)
      .then((puzzle) => {
        if (cancelled) return;
        dispatch({ type: "load", grid: puzzleGridFromRecord(puzzle) });
        setTitle(puzzle.puzzle_title);
        setSavedTitle(puzzle.puzzle_title);
        setIsShared(puzzle.is_shared);
        setLoad({ status: "ready" });
      })
      .catch((error) => {
        if (!cancelled) setLoad(isNotYours(error) ? { status: "notYours" } : { status: "error", message: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [gridId, dispatch]);

  // The "saved" flag from the Create page has been shown; drop it so a reload doesn't repeat it.
  useEffect(() => {
    if (arrivedFromSave) navigate(location.pathname, { replace: true, state: null });
  }, [arrivedFromSave, location.pathname, navigate]);

  const handleConflict = (error: unknown) => {
    if (error instanceof ApiError && error.status === 409) setIsShared(true);
    setStatus({ tone: "error", text: errorMessage(error) });
  };

  const save = async () => {
    const content = { ...state, title };
    const problem = puzzleProblems(content);
    if (problem) {
      setStatus({ tone: "error", text: problem });
      return;
    }
    setBusy("saving");
    setStatus(null);
    try {
      await apiRequest(`/users/me/grids/${gridId}`, { method: "PUT", body: puzzlePayload(content) });
      dispatch({ type: "markSaved" });
      setSavedTitle(title);
      setAnnouncement("saved");
    } catch (error) {
      handleConflict(error);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setConfirm(null);
    setBusy("deleting");
    try {
      await apiRequest(`/users/me/grids/${gridId}`, { method: "DELETE" });
      navigate("/library");
    } catch (error) {
      handleConflict(error);
      setBusy(null);
    }
  };

  // Sharing sends the saved version, so unsaved edits have to be saved first.
  const share = async (event: FormEvent) => {
    event.preventDefault();
    const recipientUsername = recipient.trim();
    if (dirty) {
      setShareStatus({ tone: "error", text: "Save your changes before sharing." });
      return;
    }
    if (!recipientUsername) {
      setShareStatus({ tone: "error", text: "Enter the username to share with." });
      return;
    }
    setBusy("sharing");
    setShareStatus(null);
    try {
      const result = await apiRequest<{ recipient?: string }>(`/users/me/grids/${gridId}/share`, {
        method: "POST",
        body: { recipientUsername },
      });
      setSharedWith(result.recipient ?? recipientUsername);
      setIsShared(true);
      setRecipient("");
      setShowShare(false);
      setAnnouncement("shared");
    } catch (error) {
      setShareStatus({ tone: "error", text: errorMessage(error) });
    } finally {
      setBusy(null);
    }
  };

  if (load.status === "loading") return <PageMessage>Loading puzzle…</PageMessage>;
  if (load.status === "notYours") {
    return <Navigate to="/home" replace state={{ notice: "That puzzle doesn't exist or isn't yours to edit." }} />;
  }
  if (load.status === "error") {
    return (
      <PageMessage>
        <p>{load.message}</p>
        <Link to="/library" className="fancyButton">
          Back to your library
        </Link>
      </PageMessage>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col gap-6 px-2 py-10 text-center">
      {announcement === "saved" && (
        <Announcement label="Puzzle saved" onClose={() => setAnnouncement(null)}>
          Puzzle <br /> saved!
        </Announcement>
      )}
      {announcement === "shared" && (
        <Announcement label="Puzzle shared" onClose={() => setAnnouncement(null)}>
          Shared with <br /> <span className="break-all">{sharedWith}</span>!
        </Announcement>
      )}
      {confirm === "delete" && (
        <ConfirmDialog
          title="Delete this puzzle?"
          message="This can't be undone."
          confirmLabel="Delete"
          onConfirm={remove}
          onCancel={() => setConfirm(null)}
        />
      )}
      {confirm === "clear" && (
        <ConfirmDialog
          title="Clear the grid?"
          message="This removes every letter, black square and clue. Nothing changes until you save."
          confirmLabel="Clear"
          onConfirm={() => {
            dispatch({ type: "clear" });
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <PageHeader center label={isShared ? "Shared puzzle" : "Your puzzle"} title="Edit" />
      {isShared && (
        <p className="mx-auto max-w-2xl border-2 border-black bg-cursor p-3 text-xl shadow-tile">
          This puzzle has been shared, so it can no longer be edited or deleted. You can still share
          it with more people.
        </p>
      )}
      <StatusMessage status={status} className="-my-3" />

      <PuzzleWorkspace
        crossword={crossword}
        title={title}
        onTitleChange={setTitle}
        readOnly={isShared}
        actions={
          <>
            {!isShared && (
              <>
                <SaveButton dirty={dirty} saving={busy === "saving"} onSave={save} disabled={busy !== null} />
                <button type="button" className="fancyButton bigger" onClick={() => setConfirm("clear")}>
                  Clear
                </button>
                <button
                  type="button"
                  className="fancyButton bigger"
                  onClick={() => setConfirm("delete")}
                  disabled={busy !== null}
                >
                  {busy === "deleting" ? "Deleting…" : "Delete"}
                </button>
              </>
            )}
            <button
              type="button"
              className="fancyButton bigger"
              aria-expanded={showShare}
              onClick={() => setShowShare((open) => !open)}
            >
              Share
            </button>
          </>
        }
      >
        {showShare && (
          <form
            onSubmit={share}
            aria-busy={busy === "sharing"}
            className="flex w-full flex-col items-center gap-2 bg-gray-200 p-4"
          >
            <label htmlFor="share-recipient" className="text-xl">
              Share with (username)
            </label>
            {!isShared && (
              <p className="max-w-md border-2 border-black bg-cursor px-3 py-2 text-lg">
                Once you share this puzzle, you won't be able to edit or delete it.
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              <UserSearch
                id="share-recipient"
                autoFocus
                value={recipient}
                onChange={setRecipient}
                disabled={busy === "sharing"}
                className="w-64"
              />
              <button type="submit" className="fancyButton" disabled={busy === "sharing"}>
                {busy === "sharing" ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    Sending…
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </div>
            <StatusMessage status={shareStatus} />
          </form>
        )}
      </PuzzleWorkspace>
    </div>
  );
}
