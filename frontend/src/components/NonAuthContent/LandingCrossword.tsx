import { useState } from "react";
import { assignNumbers, clueStarts } from "../../lib/crossword";

const SIZE = 5;
const CELLS = SIZE * SIZE;

// Starts with a pair of opposite corners filled in, so the numbering already looks like a puzzle.
const startingGrid = () => Array.from({ length: CELLS }, (_, index) => index === 4 || index === 20);

// A small grid to play with on the landing page: click squares to turn them black and watch the
// clue numbers follow. With symmetry on, the square opposite turns too, the way most published
// crosswords are built.
export default function LandingCrossword() {
  const [black, setBlack] = useState(startingGrid);
  const [symmetric, setSymmetric] = useState(true);
  const numbers = assignNumbers(black, SIZE);
  const across = clueStarts(black, SIZE, "across").length;
  const down = clueStarts(black, SIZE, "down").length;

  const toggle = (index: number) =>
    setBlack((current) => {
      const next = [...current];
      next[index] = !current[index];
      if (symmetric) next[CELLS - 1 - index] = next[index];
      return next;
    });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div
        role="group"
        aria-label="Sample crossword grid. Select squares to turn them black or white."
        className="grid w-full gap-[3px] border-3 border-black bg-black shadow-[6px_6px_0_0_#000]"
        style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`, aspectRatio: "1 / 1", containerType: "inline-size" }}
      >
        {numbers.map((number, index) => (
          <button
            key={index}
            type="button"
            aria-pressed={black[index]}
            aria-label={`Row ${Math.floor(index / SIZE) + 1}, column ${(index % SIZE) + 1}`}
            onClick={() => toggle(index)}
            className={`relative cursor-pointer transition-colors focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-blue-600 ${
              black[index] ? "bg-black hover:bg-neutral-700" : "bg-white hover:bg-yellow-200"
            }`}
          >
            {number !== null && (
              <span
                aria-hidden="true"
                className="absolute left-[6%] top-[3%] font-bold leading-none"
                style={{ fontSize: `calc(100cqw / ${SIZE} * 0.27)` }}
              >
                {number}
              </span>
            )}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="text-lg">
        <strong>{across}</strong> across clues and <strong>{down}</strong> down clues
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-lg">
          Keep it symmetric
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={symmetric}
            onChange={(event) => setSymmetric(event.target.checked)}
          />
        </label>
        <button type="button" className="fancyButton" onClick={() => setBlack(startingGrid())}>
          Start over
        </button>
      </div>
    </div>
  );
}
