import { type ReactNode, useState } from "react";
import { tidyText } from "../../lib/crossword";
import type { CrosswordModel } from "../../lib/useCrossword";
import ClueList from "./ClueList";
import CrosswordGrid from "./CrosswordGrid";

const MAX_TITLE_LENGTH = 50;

interface PuzzleWorkspaceProps {
  crossword: CrosswordModel;
  title: string;
  onTitleChange: (title: string) => void;
  // Shared puzzles are frozen: they can be browsed but not changed.
  readOnly?: boolean;
  // Extra controls for the settings bar, like the grid size picker on the Create page.
  settings?: ReactNode;
  actions: ReactNode;
  children?: ReactNode;
}

// The grid, clue lists, settings and buttons used by both the Create and Edit pages.
export default function PuzzleWorkspace({
  crossword,
  title,
  onTitleChange,
  readOnly = false,
  settings,
  actions,
  children,
}: PuzzleWorkspaceProps) {
  const [blackSquareMode, setBlackSquareMode] = useState(false);
  const editingBlackSquares = blackSquareMode && !readOnly;

  return (
    <div className="m-auto flex w-fit max-w-full flex-col items-center border-3 border-black bg-gray-200 shadow-card">
      <div className="flex w-full flex-col items-center justify-around gap-x-6 px-3 py-2 lg:flex-row">
        {settings}
        <label className="flex items-center text-xl">
          Set black squares
          <input
            type="checkbox"
            className="custom-checkbox m-2"
            checked={editingBlackSquares}
            disabled={readOnly}
            onChange={(event) => {
              setBlackSquareMode(event.target.checked);
              crossword.dispatch({ type: "clearSelection" });
            }}
          />
        </label>
        <label className="flex items-center text-xl">
          Puzzle title:
          <input
            type="text"
            maxLength={MAX_TITLE_LENGTH}
            value={title}
            readOnly={readOnly}
            className="m-2 border-2 border-black bg-white px-2 py-0.5 outline-none focus:bg-yellow-50"
            onChange={(event) => onTitleChange(event.target.value)}
            onBlur={() => {
              const tidy = tidyText(title);
              if (tidy !== title) onTitleChange(tidy);
            }}
          />
        </label>
      </div>
      {editingBlackSquares && (
        <p className="px-3 pb-2 text-lg">
          Click squares to turn them black or white. With a keyboard, move with the arrow keys and press
          Space.
        </p>
      )}
      <div aria-hidden="true" className="h-[3px] w-full bg-black" />
      <div className="flex flex-col bg-white md:flex-row">
        <CrosswordGrid
          crossword={crossword}
          label="Crossword grid"
          readOnly={readOnly}
          blackSquareMode={editingBlackSquares}
        />
        <ClueList crossword={crossword} editable={!readOnly} />
      </div>
      <div aria-hidden="true" className="h-[3px] w-full bg-black" />
      <div className="flex w-full flex-wrap justify-evenly gap-4 px-3 py-2">{actions}</div>
      {children}
    </div>
  );
}
