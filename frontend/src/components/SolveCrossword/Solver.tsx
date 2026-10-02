import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { apiRequest, errorMessage, isNotYours } from "../../lib/api";
import { useCoarsePointer } from "../../lib/useCoarsePointer";
import { puzzleGridFromRecord, useCrossword } from "../../lib/useCrossword";
import Announcement from "../Common/Announcement";
import ConfirmDialog from "../Common/ConfirmDialog";
import MenuButton from "../Common/MenuButton";
import PageHeader from "../Common/PageHeader";
import PageMessage from "../Common/PageMessage";
import SaveButton from "../Common/SaveButton";
import StatusMessage, { type Status } from "../Common/StatusMessage";
import { CHIP } from "../Common/styles";
import ClueBar from "../Crossword/ClueBar";
import ClueList from "../Crossword/ClueList";
import CrosswordGrid from "../Crossword/CrosswordGrid";
import type { SolverPuzzle } from "../utils/types";

// Wait this long after the last keystroke before asking the server to check the grid.
const AUTOCHECK_DELAY_MS = 400;
const NO_CELLS: ReadonlySet<number> = new Set();

type LoadState =
  | { status: "loading" }
  | { status: "ready"; title: string; creator: string }
  | { status: "notYours" }
  | { status: "error"; message: string };

// How much of the puzzle to check or reveal.
type Scope = "square" | "word" | "puzzle";

// Letters as they were when a square was checked or revealed. A mark only shows while the square
// still holds that letter, so typing over it clears the mark.
type LetterMarks = ReadonlyMap<number, string>;

function markedCells(marks: LetterMarks, values: readonly string[]): Set<number> {
  return new Set([...marks].filter(([cell, letter]) => values[cell] === letter).map(([cell]) => cell));
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// Keyed by puzzle id, so moving to another puzzle starts from a clean slate.
export default function Solver() {
  const { gridId = "" } = useParams();
  return <PuzzleSolver key={gridId} gridId={gridId} />;
}

function PuzzleSolver({ gridId }: { gridId: string }) {
  const crossword = useCrossword();
  const { state, dispatch, activeWord } = crossword;
  const touch = useCoarsePointer();
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState<"saved" | "solved" | null>(null);
  const [autocheck, setAutocheck] = useState(false);
  const [incorrect, setIncorrect] = useState<ReadonlySet<number>>(NO_CELLS);
  const [wrongMarks, setWrongMarks] = useState<LetterMarks>(new Map());
  const [revealedMarks, setRevealedMarks] = useState<LetterMarks>(new Map());
  const [helping, setHelping] = useState(false);
  const [confirmRevealAll, setConfirmRevealAll] = useState(false);
  const ready = load.status === "ready";

  const shownIncorrect = useMemo(() => {
    const cells = markedCells(wrongMarks, state.values);
    if (autocheck) incorrect.forEach((cell) => cells.add(cell));
    return cells;
  }, [wrongMarks, autocheck, incorrect, state.values]);
  const revealed = useMemo(() => markedCells(revealedMarks, state.values), [revealedMarks, state.values]);

  useEffect(() => {
    let cancelled = false;
    apiRequest<SolverPuzzle>(`/users/me/solver/${gridId}`)
      .then((puzzle) => {
        if (cancelled) return;
        dispatch({ type: "load", grid: puzzleGridFromRecord(puzzle) });
        setCompleted(puzzle.completed_status);
        setLoad({ status: "ready", title: puzzle.puzzle_title, creator: puzzle.creator_username });
      })
      .catch((error) => {
        if (!cancelled) setLoad(isNotYours(error) ? { status: "notYours" } : { status: "error", message: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [gridId, dispatch]);

  // The answers never leave the server, so autocheck asks it which letters are wrong.
  useEffect(() => {
    if (!autocheck || !ready) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      apiRequest<{ incorrect: number[] }>(`/users/me/solver/${gridId}/check`, {
        method: "POST",
        body: { gridValues: state.values },
      })
        .then((result) => {
          if (!cancelled) setIncorrect(new Set(result.incorrect));
        })
        .catch((error) => {
          if (!cancelled) setStatus({ tone: "error", text: errorMessage(error) });
        });
    }, AUTOCHECK_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [autocheck, ready, gridId, state.values]);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const result = await apiRequest<{ completed: boolean }>(`/users/me/solver/${gridId}`, {
        method: "PATCH",
        body: { gridValues: state.values },
      });
      dispatch({ type: "markSaved" });
      setCompleted(result.completed);
      setAnnouncement(result.completed ? "solved" : "saved");
    } catch (error) {
      setStatus({ tone: "error", text: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  // The squares a check or reveal covers. Square and word need a selected square.
  const scopeCells = (scope: Scope): number[] => {
    if (scope === "puzzle") return state.black.flatMap((isBlack, cell) => (isBlack ? [] : [cell]));
    if (!state.selection) return [];
    return scope === "square" ? [state.selection.cell] : [...activeWord];
  };

  // The answers stay on the server, which says which of these letters are wrong.
  const check = async (scope: Scope) => {
    const values = state.values;
    const cells = scopeCells(scope);
    if (!cells.some((cell) => values[cell])) {
      setStatus({ tone: "error", text: "Fill in some letters first, then check them." });
      return;
    }
    setHelping(true);
    setStatus(null);
    try {
      const result = await apiRequest<{ incorrect: number[] }>(`/users/me/solver/${gridId}/check`, {
        method: "POST",
        body: { gridValues: values },
      });
      const wrong = result.incorrect.filter((cell) => cells.includes(cell));
      setWrongMarks((marks) => {
        const next = new Map(marks);
        cells.forEach((cell) => next.delete(cell));
        wrong.forEach((cell) => next.set(cell, values[cell]));
        return next;
      });
      setStatus(
        wrong.length === 0
          ? { tone: "success", text: "No mistakes so far." }
          : { tone: "error", text: `${plural(wrong.length, "wrong letter")}, marked in red.` },
      );
    } catch (error) {
      setStatus({ tone: "error", text: errorMessage(error) });
    } finally {
      setHelping(false);
    }
  };

  const reveal = async (scope: Scope) => {
    setConfirmRevealAll(false);
    const cells = scopeCells(scope);
    if (cells.length === 0) return;
    setHelping(true);
    setStatus(null);
    try {
      const { letters } = await apiRequest<{ letters: { cell: number; letter: string }[] }>(
        `/users/me/solver/${gridId}/reveal`,
        { method: "POST", body: { cells } },
      );
      dispatch({ type: "fillCells", letters });
      const filled = letters.filter(({ letter }) => letter);
      setRevealedMarks((marks) => new Map([...marks, ...filled.map(({ cell, letter }) => [cell, letter] as const)]));
      setWrongMarks((marks) => new Map([...marks].filter(([cell]) => !cells.includes(cell))));
    } catch (error) {
      setStatus({ tone: "error", text: errorMessage(error) });
    } finally {
      setHelping(false);
    }
  };

  const scopeItems = (onSelect: (scope: Scope) => void) => [
    { label: "This square", onSelect: () => onSelect("square"), disabled: !state.selection },
    { label: "This word", onSelect: () => onSelect("word"), disabled: !state.selection },
    { label: "Whole puzzle", onSelect: () => onSelect("puzzle") },
  ];

  if (load.status === "loading") return <PageMessage>Loading puzzle…</PageMessage>;
  if (load.status === "notYours") {
    return (
      <Navigate
        to="/home"
        replace
        state={{ notice: "That puzzle doesn't exist or hasn't been shared with you." }}
      />
    );
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
    <section className="flex min-h-[80vh] flex-col gap-6 px-2 py-10 text-center">
      {announcement === "saved" && (
        <Announcement label="Progress saved" onClose={() => setAnnouncement(null)}>
          Progress <br /> saved!
        </Announcement>
      )}
      {announcement === "solved" && (
        <Announcement label="Puzzle solved" onClose={() => setAnnouncement(null)}>
          Puzzle <br /> solved!
        </Announcement>
      )}
      {confirmRevealAll && (
        <ConfirmDialog
          title="Reveal the whole puzzle?"
          message="This fills in every answer."
          confirmLabel="Reveal"
          onConfirm={() => reveal("puzzle")}
          onCancel={() => setConfirmRevealAll(false)}
        />
      )}

      <PageHeader
        center
        label={`By ${load.creator}`}
        title={load.title}
        aside={completed && <span className={`${CHIP} shrink-0 bg-black text-white`}>Solved</span>}
      />
      <StatusMessage status={status} className="-my-3" />

      {/* The 3px gaps let the black background show through as divider lines. On phones the buttons
          sit right under the grid, above the clue list. */}
      <div className="m-auto grid w-fit max-w-full gap-[3px] border-3 border-black bg-black shadow-card md:grid-cols-[auto_auto]">
        {/* Touch devices show the clue on the crossword keyboard instead. */}
        {/* w-0 min-w-full: fill the column without widening it past the grid. */}
        {!touch && (
          <div className="w-0 min-w-full bg-gray-200 p-3 md:col-span-2">
            <ClueBar crossword={crossword} />
          </div>
        )}
        <div className="order-1 bg-white">
          <CrosswordGrid crossword={crossword} label="Crossword grid" incorrect={shownIncorrect} revealed={revealed} />
        </div>
        <ClueList crossword={crossword} editable={false} className="order-3 bg-white md:order-2" />
        <div className="order-2 flex w-0 min-w-full flex-wrap items-center justify-evenly gap-x-4 gap-y-3 bg-gray-200 px-3 py-2 md:order-3 md:col-span-2">
          <SaveButton dirty={state.dirty} saving={saving} onSave={save} label="Save progress" />
          <MenuButton label="Check" items={scopeItems(check)} disabled={helping} />
          <MenuButton
            label="Reveal"
            items={scopeItems((scope) => (scope === "puzzle" ? setConfirmRevealAll(true) : reveal(scope)))}
            disabled={helping}
          />
          <label className="flex items-center text-xl">
            Autocheck
            <input
              type="checkbox"
              className="custom-checkbox m-2"
              checked={autocheck}
              onChange={(event) => setAutocheck(event.target.checked)}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
