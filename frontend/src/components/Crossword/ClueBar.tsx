import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PointerEvent } from "react";
import type { CrosswordModel } from "../../lib/useCrossword";

// Keeps focus (and the selected square) in the grid when a button here is pressed.
const keepGridFocus = (event: PointerEvent) => event.preventDefault();

interface ClueBarProps {
  crossword: CrosswordModel;
  // Smaller version that sits on top of the on-screen keyboard.
  compact?: boolean;
}

// The current clue, with buttons to step through the clues. Tapping the clue switches between
// across and down.
export default function ClueBar({ crossword, compact = false }: ClueBarProps) {
  const { state, dispatch, numbers, activeClue } = crossword;
  const clues = activeClue?.direction === "down" ? state.downClues : state.acrossClues;
  const label = activeClue
    ? `${numbers[activeClue.index]}${activeClue.direction === "across" ? "A" : "D"}`
    : null;

  const stepButton = `flex shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 ${
    compact ? "h-11 w-11 text-xl" : "h-12 w-12"
  }`;

  return (
    <div
      className={`flex w-full items-center gap-1 bg-white ${
        compact ? "rounded-lg px-1 text-lg" : "border-2 border-black p-2 text-2xl"
      }`}
    >
      <button
        type="button"
        aria-label="Previous clue"
        className={stepButton}
        onPointerDown={keepGridFocus}
        onClick={() => dispatch({ type: "nextClue", forward: false })}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
      {activeClue ? (
        <button
          type="button"
          title="Switch between across and down"
          className={`min-h-11 flex-1 cursor-pointer text-center leading-snug ${compact ? "line-clamp-2" : ""}`}
          onPointerDown={keepGridFocus}
          onClick={() => dispatch({ type: "toggleDirection" })}
        >
          <span className="mr-3 font-bold">{label}</span>
          {clues[activeClue.index] || "No clue written"}
        </button>
      ) : (
        <p className="flex-1 text-center text-gray-600">Select a square to see its clue</p>
      )}
      <button
        type="button"
        aria-label="Next clue"
        className={stepButton}
        onPointerDown={keepGridFocus}
        onClick={() => dispatch({ type: "nextClue", forward: true })}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}
