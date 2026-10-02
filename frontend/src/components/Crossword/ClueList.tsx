import { type KeyboardEvent, useEffect, useLayoutEffect, useRef } from "react";
import { type Direction, tidyText } from "../../lib/crossword";
import type { CrosswordModel } from "../../lib/useCrossword";

const MAX_CLUE_LENGTH = 50;
const TEXTAREA_MAX_HEIGHT = 72;

// Scrolls only the clue list, never the page, so typing in the grid doesn't make it jump.
function scrollWithin(container: HTMLElement, item: HTMLElement) {
  const box = container.getBoundingClientRect();
  const target = item.getBoundingClientRect();
  if (target.top < box.top) container.scrollTop -= box.top - target.top;
  else if (target.bottom > box.bottom) container.scrollTop += target.bottom - box.bottom;
}

function ClueTextarea({
  label,
  value,
  onChange,
  onFocus,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  onFocus: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow to fit up to three lines of text.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [value]);

  // Clues are a single line, so Enter doesn't add a line break.
  const blockEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") event.preventDefault();
  };

  return (
    <textarea
      ref={ref}
      aria-label={label}
      rows={1}
      maxLength={MAX_CLUE_LENGTH}
      value={value}
      className="w-full resize-none border border-black bg-transparent px-1 text-xl"
      onChange={(event) => onChange(event.target.value)}
      onFocus={onFocus}
      // Stray spaces never get saved, so tidy them away as soon as the clue is done.
      onBlur={() => {
        const tidy = tidyText(value);
        if (tidy !== value) onChange(tidy);
      }}
      onKeyDown={blockEnter}
    />
  );
}

function ClueSection({
  crossword,
  direction,
  editable,
}: {
  crossword: CrosswordModel;
  direction: Direction;
  editable: boolean;
}) {
  const { state, dispatch, numbers, acrossStarts, downStarts, activeClue, crossingClue } = crossword;
  const starts = direction === "across" ? acrossStarts : downStarts;
  const clues = direction === "across" ? state.acrossClues : state.downClues;
  const listRef = useRef<HTMLOListElement>(null);

  const highlighted =
    activeClue?.direction === direction ? activeClue.index : crossingClue?.direction === direction ? crossingClue.index : null;
  const highlightClass = activeClue?.direction === direction ? "bg-blue-200" : "bg-blue-50";

  useEffect(() => {
    const list = listRef.current;
    const item = highlighted === null ? null : list?.querySelector<HTMLElement>(`[data-clue="${highlighted}"]`);
    if (list && item) scrollWithin(list, item);
  }, [highlighted]);

  const title = direction === "across" ? "Across" : "Down";

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label={`${title} clues`}>
      <div className="flex justify-center border-2 border-black bg-gray-200 py-1">
        <h3 className="w-fit bg-black px-2 text-xl font-bold text-white">{title}</h3>
      </div>
      <ol ref={listRef} className="min-h-0 flex-1 list-none overflow-y-auto border-2 border-black bg-white p-2">
        {starts.map((index) => {
          const number = numbers[index];
          const isHighlighted = highlighted === index;
          return (
            <li
              key={index}
              data-clue={index}
              className={`flex items-start gap-2 rounded-sm px-1 py-0.5 ${isHighlighted ? highlightClass : ""}`}
            >
              <span className="w-7 shrink-0 pt-0.5 text-right text-lg font-bold">{number}</span>
              {editable ? (
                <ClueTextarea
                  label={`${number} ${direction} clue`}
                  value={clues[index]}
                  onChange={(text) => dispatch({ type: "setClue", direction, index, text })}
                  onFocus={() => dispatch({ type: "selectClue", index, direction, focusGrid: false })}
                />
              ) : (
                <button
                  type="button"
                  className="w-full cursor-pointer text-left text-xl hover:underline"
                  onClick={() => dispatch({ type: "selectClue", index, direction, focusGrid: true })}
                >
                  {clues[index] || <span className="italic text-gray-600">No clue written</span>}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

interface ClueListProps {
  crossword: CrosswordModel;
  editable: boolean;
  className?: string;
}

// Across and down clue lists. Each clue is tied to the square it starts at, so adding or removing
// black squares never moves text onto the wrong clue. On wide screens the list matches the grid's
// height; on phones it has its own fixed height below the grid.
export default function ClueList({ crossword, editable, className = "" }: ClueListProps) {
  return (
    <div className={`relative h-[28rem] w-full md:h-auto md:w-80 lg:w-96 ${className}`}>
      <div className="absolute inset-0 flex flex-col gap-1">
        <ClueSection crossword={crossword} direction="across" editable={editable} />
        <ClueSection crossword={crossword} direction="down" editable={editable} />
      </div>
    </div>
  );
}
