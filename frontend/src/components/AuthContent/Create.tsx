import { useState } from "react";
import { useNavigate } from "react-router";
import { apiRequest, errorMessage } from "../../lib/api";
import { GRID_SIZES, puzzlePayload, puzzleProblems } from "../../lib/crossword";
import { useCrossword } from "../../lib/useCrossword";
import ConfirmDialog from "../Common/ConfirmDialog";
import Modal from "../Common/Modal";
import PageHeader from "../Common/PageHeader";
import StatusMessage, { type Status } from "../Common/StatusMessage";
import PuzzleWorkspace from "../Crossword/PuzzleWorkspace";
import Help from "./Help";

export default function Create() {
  const crossword = useCrossword(5);
  const { state, dispatch } = crossword;
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [saving, setSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [pendingSize, setPendingSize] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const navigate = useNavigate();

  const changeSize = (size: number) => {
    dispatch({ type: "reset", size });
    setPendingSize(null);
  };

  const clear = () => {
    dispatch({ type: "reset", size: state.size });
    setConfirmClear(false);
    setStatus(null);
  };

  // A new grid size starts a fresh grid, so ask first if there's work to lose.
  const handleSizeChange = (size: number) => {
    if (state.dirty) setPendingSize(size);
    else changeSize(size);
  };

  const save = async () => {
    const content = { ...state, title };
    const problem = puzzleProblems(content);
    if (problem) {
      setStatus({ tone: "error", text: problem });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const { grid_id } = await apiRequest<{ grid_id: number }>("/users/me/grids", {
        method: "POST",
        body: puzzlePayload(content),
      });
      // Carry on in the editor, so another click on Save updates this puzzle instead of
      // creating a copy.
      navigate(`/editor/${grid_id}`, { state: { saved: true } });
    } catch (error) {
      setStatus({ tone: "error", text: errorMessage(error) });
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-2 py-10 text-center">
      {showHelp && (
        <Modal label="How to create a crossword" variant="light" onClose={() => setShowHelp(false)}>
          <Help />
          {/* No autofocus here: focusing a button at the end would open the dialog scrolled to the bottom. */}
          <button type="button" className="fancyButton bigger self-center" onClick={() => setShowHelp(false)}>
            Close
          </button>
        </Modal>
      )}
      {pendingSize !== null && (
        <ConfirmDialog
          title="Start a new grid?"
          message="Changing the grid size clears the current grid and clues."
          confirmLabel="Change size"
          onConfirm={() => changeSize(pendingSize)}
          onCancel={() => setPendingSize(null)}
        />
      )}
      {confirmClear && (
        <ConfirmDialog
          title="Clear the grid?"
          message="This removes every letter, black square and clue."
          confirmLabel="Clear"
          onConfirm={clear}
          onCancel={() => setConfirmClear(false)}
        />
      )}
      <PageHeader
        center
        label="New puzzle"
        title="Create"
        aside={
          <button
            type="button"
            aria-label="How to create a crossword"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center border-2 border-black bg-cursor text-2xl font-extrabold shadow-tile transition hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_#000]"
            onClick={() => setShowHelp(true)}
          >
            ?
          </button>
        }
      />
      <StatusMessage status={status} className="-my-3" />
      <PuzzleWorkspace
        crossword={crossword}
        title={title}
        onTitleChange={setTitle}
        settings={
          <label className="flex items-center text-xl">
            Grid size:
            <select
              value={state.size}
              onChange={(event) => handleSizeChange(Number(event.target.value))}
              className="select-chevron ml-2 cursor-pointer border-2 border-black bg-white px-1 py-0.5 text-xl outline-none focus:bg-yellow-50"
            >
              {GRID_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} x {size}
                </option>
              ))}
            </select>
          </label>
        }
        actions={
          <>
            <button type="button" className="fancyButton bigger" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="fancyButton bigger"
              onClick={() => (state.dirty ? setConfirmClear(true) : clear())}
            >
              Clear
            </button>
          </>
        }
      />
    </div>
  );
}
