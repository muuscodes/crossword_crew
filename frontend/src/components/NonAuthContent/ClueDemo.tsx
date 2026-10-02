import { useState } from "react";
import type { Direction } from "../../lib/crossword";

const SIZE = 5;
// A word square: every row and every column is a word.
const ROWS = ["HEART", "EMBER", "ABUSE", "RESIN", "TREND"];
const STARTING_CLUES: Record<Direction, string[]> = {
  across: [
    "Organ that keeps the beat",
    "Glowing bit of a dying fire",
    "Misuse",
    "Sticky stuff from a pine",
    "What's in style right now",
  ],
  down: ["Courage, figuratively", "Last spark", "Mistreat", "Amber, once", "Fad"],
};
const LINES = [0, 1, 2, 3, 4];

const flip = (direction: Direction): Direction => (direction === "across" ? "down" : "across");

// In a grid with no black squares the top row numbers the downs 1 to 5, and the rows below
// start at 6.
const clueNumber = (direction: Direction, line: number) => (direction === "down" || line === 0 ? line + 1 : line + 5);

function squareNumber(index: number) {
  const row = Math.floor(index / SIZE);
  const column = index % SIZE;
  if (row === 0) return column + 1;
  return column === 0 ? row + 5 : null;
}

// A filled-in grid next to its clues, wired up like the editor: pick a clue and its squares light
// up, click a square to see its clue, click it again to switch between across and down. The clues
// can be rewritten.
export default function ClueDemo() {
  const [selection, setSelection] = useState<{ cell: number; direction: Direction }>({ cell: 0, direction: "across" });
  const [clues, setClues] = useState(STARTING_CLUES);
  const { cell, direction } = selection;
  const row = Math.floor(cell / SIZE);
  const column = cell % SIZE;
  const line = direction === "across" ? row : column;
  const crossingLine = direction === "across" ? column : row;
  const inWord = (index: number) => (direction === "across" ? Math.floor(index / SIZE) === row : index % SIZE === column);

  const clickSquare = (index: number) =>
    setSelection((current) =>
      index === current.cell ? { cell: index, direction: flip(current.direction) } : { ...current, cell: index },
    );
  const pickClue = (clueDirection: Direction, clueLine: number) =>
    setSelection({ cell: clueDirection === "across" ? clueLine * SIZE : clueLine, direction: clueDirection });
  const editClue = (clueDirection: Direction, clueLine: number, text: string) =>
    setClues((current) => ({
      ...current,
      [clueDirection]: current[clueDirection].map((clue, index) => (index === clueLine ? text : clue)),
    }));

  const squareColor = (index: number) =>
    index === cell ? "bg-yellow-200" : inWord(index) ? "bg-blue-200" : "bg-white hover:bg-neutral-100";
  const clueColor = (clueDirection: Direction, clueLine: number) => {
    if (clueDirection === direction && clueLine === line) return "bg-blue-200";
    if (clueDirection !== direction && clueLine === crossingLine) return "bg-blue-50";
    return "";
  };

  return (
    <div className="grid w-full max-w-xl gap-[3px] border-3 border-black bg-black text-left shadow-[6px_6px_0_0_#000]">
      {/* The clue being worked on, like the bar above the grid in the app. */}
      <div className="bg-gray-200 p-2">
        <p role="status" aria-label="Current clue" className="flex min-h-12 items-center gap-3 border-2 border-black bg-white px-3 py-2 text-xl">
          <strong className="shrink-0">
            {clueNumber(direction, line)}
            {direction === "across" ? "A" : "D"}
          </strong>{" "}
          <span className="min-w-0 break-words">
            {clues[direction][line] || <span className="text-neutral-500">No clue yet</span>}
          </span>
        </p>
      </div>
      {/* The grid sits beside the across clues, which are about as tall, and the down clues run
          underneath. */}
      <div className="grid gap-[3px] sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <div className="bg-white">
          <div
            role="group"
            aria-label="Sample filled-in grid"
            className="grid gap-[2px] bg-black"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`, aspectRatio: "1 / 1", containerType: "inline-size" }}
          >
            {ROWS.join("").split("").map((letter, index) => {
              const number = squareNumber(index);
              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Row ${Math.floor(index / SIZE) + 1}, column ${(index % SIZE) + 1}, ${letter}`}
                  aria-pressed={index === cell}
                  onClick={() => clickSquare(index)}
                  className={`relative flex cursor-pointer items-center justify-center pt-[8%] font-bold transition-colors ${squareColor(index)}`}
                  style={{ fontSize: `calc(100cqw / ${SIZE} * 0.55)` }}
                >
                  {number !== null && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[6%] top-[3%] font-bold leading-none"
                      style={{ fontSize: `calc(100cqw / ${SIZE} * 0.25)` }}
                    >
                      {number}
                    </span>
                  )}
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
        {(["across", "down"] as const).map((clueDirection) => {
          const title = clueDirection === "across" ? "Across" : "Down";
          return (
            <section
              key={clueDirection}
              aria-label={`${title} clues`}
              className={`bg-white ${clueDirection === "down" ? "sm:col-span-2" : ""}`}
            >
              <h3 className="bg-gray-200 py-1 text-center">
                <span className="bg-black px-2 text-lg font-bold text-white">{title}</span>
              </h3>
              <ol className="p-1.5">
                {LINES.map((clueLine) => {
                  const number = clueNumber(clueDirection, clueLine);
                  return (
                    <li
                      key={clueLine}
                      className={`flex items-center gap-2 rounded-sm px-1 transition-colors ${clueColor(clueDirection, clueLine)}`}
                    >
                      <span className="w-6 shrink-0 text-right font-bold">{number}</span>
                      <input
                        type="text"
                        aria-label={`${number} ${clueDirection} clue`}
                        maxLength={50}
                        value={clues[clueDirection][clueLine]}
                        onChange={(event) => editClue(clueDirection, clueLine, event.target.value)}
                        onFocus={() => pickClue(clueDirection, clueLine)}
                        className="min-w-0 flex-1 bg-transparent py-0.5 text-lg outline-none"
                      />
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
