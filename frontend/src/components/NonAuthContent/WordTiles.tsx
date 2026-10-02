import type { CSSProperties } from "react";
import { useInView } from "../../lib/useInView";

export interface TileEntry {
  // The letters, with "#" for a black square.
  word: string;
  // Clue number in the corner of the first square.
  number?: number;
  // Squares [start, end) highlighted like the word being typed in the app, with the cursor on the
  // first of them.
  highlight?: [number, number];
}

function tileColor(entry: TileEntry, index: number) {
  if (entry.word[index] === "#") return "bg-black";
  const [start, end] = entry.highlight ?? [-1, -1];
  if (index === start) return "bg-yellow-200";
  if (index > start && index < end) return "bg-blue-200";
  return "bg-white";
}

// Words written into crossword squares, one row per entry. Screen readers skip the tiles, so the
// heading around them needs its own text. Letters drop in one after another, as if someone were
// typing them, once the tiles scroll into view.
export default function WordTiles({ entries }: { entries: TileEntry[] }) {
  const [ref, inView] = useInView<HTMLSpanElement>();
  // Where each entry starts in the typing order, so the drop-in runs across rows.
  const offsets = entries.map((_, row) => entries.slice(0, row).reduce((total, { word }) => total + word.length, 0));

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="flex flex-col items-center gap-[clamp(0.5rem,1.5vw,1rem)]"
      style={{ "--tile": "clamp(1.6rem, 8.6vw, 5.25rem)" } as CSSProperties}
    >
      {entries.map((entry, row) => (
        <span key={entry.word} className="inline-grid grid-flow-col gap-[3px] border-3 border-black bg-black shadow-[6px_6px_0_0_#000]">
          {[...entry.word].map((letter, column) => (
            <span
              key={column}
              className={`relative flex items-center justify-center font-extrabold leading-none ${tileColor(entry, column)}`}
              style={{ width: "var(--tile)", height: "var(--tile)", fontSize: "calc(var(--tile) * 0.62)" }}
            >
              {column === 0 && entry.number !== undefined && (
                <span className="absolute left-[7%] top-[5%] font-bold" style={{ fontSize: "calc(var(--tile) * 0.22)" }}>
                  {entry.number}
                </span>
              )}
              {letter !== "#" && (
                <span
                  className={`pt-[8%] ${inView ? "letter-in" : "opacity-0"}`}
                  style={{ animationDelay: `${150 + (offsets[row] + column) * 55}ms` }}
                >
                  {letter}
                </span>
              )}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
