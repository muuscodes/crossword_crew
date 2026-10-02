import { type ChangeEvent, type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import type { Move } from "../../lib/crossword";
import { useCoarsePointer } from "../../lib/useCoarsePointer";
import type { CrosswordModel } from "../../lib/useCrossword";
import MobileKeyboard from "./MobileKeyboard";

const ARROW_MOVES: Partial<Record<string, Move>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

const INCORRECT = "shadow-[inset_0_0_0_3px_var(--color-red-500)]";
// A small triangle in the top right corner of revealed squares, like a folded-down page corner.
const REVEALED_MARK =
  "pointer-events-none absolute right-0 top-0 h-[24%] w-[24%] bg-blue-600 [clip-path:polygon(0_0,100%_0,100%_100%)]";

// Bigger grids get more of a wide screen; phones get nearly the full screen width.
function boardWidth(size: number) {
  const vw = size <= 7 ? 30 : size <= 11 ? 35 : 40;
  return `min(94vw, max(22rem, ${vw}vw))`;
}

interface CrosswordGridProps {
  crossword: CrosswordModel;
  label: string;
  // Letters can't be changed, but squares can still be selected to read clues.
  readOnly?: boolean;
  // Clicking a square turns it black or white instead of selecting it.
  blackSquareMode?: boolean;
  // Squares to outline in red (checked and wrong).
  incorrect?: ReadonlySet<number>;
  // Squares whose letters were revealed, shown in blue.
  revealed?: ReadonlySet<number>;
}

// The one crossword grid used by the Create, Edit and Solve pages. On touch devices the squares are
// buttons, so the phone's keyboard never opens, and typing happens on the crossword keyboard.
export default function CrosswordGrid({
  crossword,
  label,
  readOnly = false,
  blackSquareMode = false,
  incorrect,
  revealed,
}: CrosswordGridProps) {
  const { state, dispatch, numbers, activeWord } = crossword;
  const { size, black, values, selection, focusGrid } = state;
  const touch = useCoarsePointer();
  const cellRefs = useRef<(HTMLElement | null)[]>([]);
  // The square that Tab lands on in black square mode. Arrow keys move it from there.
  const [blackCursor, setBlackCursor] = useState(0);
  const cursor = blackCursor < size * size ? blackCursor : 0;
  const showKeyboard = touch && !readOnly && !blackSquareMode && selection !== null && focusGrid;

  // Keyboard navigation changes the selection, so move focus to follow it. Scrolling only as far
  // as needed (and never under the on-screen keyboard) keeps the page from jumping around.
  useEffect(() => {
    if (!selection || !focusGrid || blackSquareMode) return;
    const cell = cellRefs.current[selection.cell];
    if (!cell) return;
    if (document.activeElement !== cell) cell.focus({ preventScroll: true });
    cell.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [selection, focusGrid, blackSquareMode]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const move = ARROW_MOVES[event.key];
    if (move) {
      event.preventDefault();
      dispatch({ type: "move", move });
      return;
    }
    switch (event.key) {
      case "Tab":
        event.preventDefault();
        dispatch({ type: "nextClue", forward: !event.shiftKey });
        return;
      case " ":
        event.preventDefault();
        dispatch({ type: "toggleDirection" });
        return;
      case "Enter":
        event.preventDefault();
        return;
      case "Escape":
        event.currentTarget.blur();
        dispatch({ type: "clearSelection" });
        return;
      case "Backspace":
      case "Delete":
        event.preventDefault();
        if (!readOnly) dispatch({ type: event.key === "Delete" ? "clearCell" : "backspace" });
        return;
    }
    if (event.key.length === 1) {
      event.preventDefault();
      if (!readOnly) dispatch({ type: "input", key: event.key });
    }
  }

  // In black square mode the arrow keys move between all squares, black ones included, and Space
  // or Enter (the button's own keys) turns the focused square black or white.
  function handleBlackSquareKeys(event: KeyboardEvent<HTMLElement>, index: number) {
    const move = ARROW_MOVES[event.key];
    if (!move) return;
    event.preventDefault();
    const row = Math.floor(index / size);
    const column = index % size;
    const next = {
      left: column > 0 ? index - 1 : index,
      right: column < size - 1 ? index + 1 : index,
      up: row > 0 ? index - size : index,
      down: row < size - 1 ? index + size : index,
    }[move];
    cellRefs.current[next]?.focus();
  }

  // Some keyboards (handwriting, dictation, odd layouts) don't report which key was pressed, so
  // their typing arrives here instead.
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (readOnly) return;
    const typed = [...event.target.value].at(-1);
    dispatch(typed === undefined ? { type: "clearCell" } : { type: "input", key: typed });
  }

  // Handle the click ourselves so clicking the selected square flips direction instead of the
  // browser's focus event re-selecting it.
  function handleMouseDown(event: MouseEvent, index: number) {
    if (black[index]) return;
    event.preventDefault();
    dispatch({ type: "clickCell", index });
    cellRefs.current[index]?.focus({ preventScroll: true });
  }

  function cellColor(index: number) {
    if (black[index]) return "bg-black";
    if (selection?.cell === index) return "bg-yellow-200";
    if (activeWord.has(index)) return "bg-blue-200";
    return "bg-white";
  }

  const fontSize = (fraction: number) => `calc(100cqw / ${size} * ${fraction})`;
  const letterClass =
    "absolute inset-0 h-full w-full cursor-pointer bg-transparent pt-[8%] text-center font-bold uppercase";
  // Keeps a selected square clear of the on-screen keyboard when the page scrolls to it.
  const scrollMargin = { scrollMarginBottom: "calc(var(--keyboard-height, 0px) + 0.5rem)", scrollMarginTop: "4.5rem" };

  return (
    <>
      <div
        role="group"
        aria-label={label}
        className="grid shrink-0 select-none border-3 border-black bg-white"
        style={{
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          width: boardWidth(size),
          aspectRatio: "1 / 1",
          containerType: "inline-size",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {Array.from({ length: size * size }, (_, index) => {
          const row = Math.floor(index / size) + 1;
          const column = (index % size) + 1;
          const number = numbers[index];
          const isBlack = black[index];
          const isRevealed = revealed?.has(index) ?? false;
          const position = `Row ${row}, column ${column}${number ? `, number ${number}` : ""}`;
          const letterLabel = `${values[index] || "empty"}${isRevealed ? ", revealed" : ""}`;
          const ref = (element: HTMLElement | null) => {
            cellRefs.current[index] = element;
          };

          let content = null;
          if (blackSquareMode) {
            content = (
              <button
                ref={ref}
                type="button"
                tabIndex={index === cursor ? 0 : -1}
                aria-pressed={isBlack}
                aria-label={`${position}, ${isBlack ? "black" : "white"} square`}
                className={`absolute inset-0 flex h-full w-full cursor-pointer items-center justify-center pt-[8%] font-bold focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-blue-600 ${
                  isBlack ? "hover:bg-white/30" : "hover:bg-black/20"
                }`}
                style={{ fontSize: fontSize(0.55) }}
                onClick={() => dispatch({ type: "toggleBlack", index })}
                onFocus={() => setBlackCursor(index)}
                onKeyDown={(event) => handleBlackSquareKeys(event, index)}
              >
                {isBlack ? "" : values[index]}
              </button>
            );
          } else if (!isBlack && touch) {
            content = (
              <button
                ref={ref}
                type="button"
                aria-label={`${position}, ${letterLabel}`}
                className={`${letterClass} outline-none ${isRevealed ? "text-blue-700" : ""}`}
                style={{ fontSize: fontSize(0.55), ...scrollMargin }}
                onClick={() => dispatch({ type: "clickCell", index })}
                onKeyDown={handleKeyDown}
              >
                {values[index]}
              </button>
            );
          } else if (!isBlack) {
            content = (
              <input
                ref={ref}
                type="text"
                value={values[index]}
                readOnly={readOnly}
                aria-label={isRevealed ? `${position}, revealed` : position}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                className={`${letterClass} caret-transparent outline-none ${isRevealed ? "text-blue-700" : ""}`}
                style={{ fontSize: fontSize(0.55), ...scrollMargin }}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onFocus={() => dispatch({ type: "focusCell", index })}
              />
            );
          }

          return (
            <div
              key={index}
              className={`relative border border-black ${cellColor(index)} ${incorrect?.has(index) ? INCORRECT : ""}`}
              onMouseDown={blackSquareMode || touch ? undefined : (event) => handleMouseDown(event, index)}
            >
              {number !== null && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[6%] top-[3%] leading-none"
                  style={{ fontSize: fontSize(0.27) }}
                >
                  {number}
                </span>
              )}
              {isRevealed && <span aria-hidden="true" className={REVEALED_MARK} />}
              {content}
            </div>
          );
        })}
      </div>
      {showKeyboard && <MobileKeyboard crossword={crossword} />}
    </>
  );
}
