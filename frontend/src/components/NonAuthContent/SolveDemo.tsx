import { faChevronLeft, faChevronRight, faDeleteLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

const SIZE = 5;
// A puzzle partway through: "_" is still empty. Row 2 has a wrong letter (A where E belongs),
// row 3 is being typed, and the R starting row 4 was revealed.
const LETTERS = ["HEART", "EMBAR", "AB___", "R____", "T____"].join("");
const WRONG = 8;
const REVEALED = 15;
const CURSOR = 12;
const WORD = new Set([10, 11, 12, 13, 14]);
const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

function squareColor(index: number) {
  if (index === CURSOR) return "bg-yellow-200";
  if (WORD.has(index)) return "bg-blue-200";
  return "bg-white";
}

const Key = ({ children, wide = false }: { children: ReactNode; wide?: boolean }) => (
  <span
    className={`flex h-7 min-w-0 items-center justify-center rounded-[3px] bg-white text-xs font-bold shadow-[0_1px_0_rgba(0,0,0,0.35)] ${
      wide ? "flex-[1.6] text-[0.6rem]" : "flex-1"
    }`}
  >
    {children}
  </span>
);

// A phone solving a puzzle with the crossword keyboard, plus what the colors mean. The phone is a
// picture; the legend under it is real text.
export default function SolveDemo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <figure
        role="img"
        aria-label="A phone solving a crossword with the crossword keyboard. The clue Misuse is being typed, one wrong letter is outlined in red, and one revealed letter is shown in blue."
        className="w-[17.5rem] rounded-[2.25rem] border-3 border-black bg-white p-3 shadow-[6px_6px_0_0_#000]"
      >
        <span className="mx-auto mb-3 block h-1.5 w-16 rounded-full bg-black" />
        <p className="mb-2 text-center text-lg font-bold">Heart of the Matter</p>
        <div
          className="grid gap-[2px] border-2 border-black bg-black"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`, aspectRatio: "1 / 1", containerType: "inline-size" }}
        >
          {[...LETTERS].map((letter, index) => (
            <span
              key={index}
              className={`relative flex items-center justify-center pt-[8%] font-bold ${squareColor(index)} ${
                index === WRONG ? "shadow-[inset_0_0_0_3px_var(--color-red-500)]" : ""
              } ${index === REVEALED ? "text-blue-700" : ""}`}
              style={{ fontSize: `calc(100cqw / ${SIZE} * 0.55)` }}
            >
              {index === REVEALED && (
                <span className="absolute right-0 top-0 h-[24%] w-[24%] bg-blue-600 [clip-path:polygon(0_0,100%_0,100%_100%)]" />
              )}
              {letter === "_" ? "" : letter}
            </span>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-neutral-300 p-1.5">
          <p className="mb-1.5 flex items-center gap-1 rounded-md bg-white px-1 py-1.5 text-sm">
            <FontAwesomeIcon icon={faChevronLeft} className="px-1" />
            <span className="flex-1 text-center">
              <strong className="mr-2">7A</strong>Misuse
            </span>
            <FontAwesomeIcon icon={faChevronRight} className="px-1" />
          </p>
          <div className="flex flex-col gap-1">
            {KEY_ROWS.map((row, rowIndex) => (
              <div key={row} className={`flex gap-[3px] ${rowIndex === 1 ? "px-[5%]" : ""}`}>
                {rowIndex === 2 && <Key wide>Across</Key>}
                {[...row].map((letter) => (
                  <Key key={letter}>{letter}</Key>
                ))}
                {rowIndex === 2 && (
                  <Key wide>
                    <FontAwesomeIcon icon={faDeleteLeft} />
                  </Key>
                )}
              </div>
            ))}
          </div>
        </div>
      </figure>
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-lg">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-5 w-5 border-2 border-black bg-yellow-200" />
          Where you're typing
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-5 w-5 border-2 border-black bg-white shadow-[inset_0_0_0_3px_var(--color-red-500)]" />
          Wrong, after a check
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="relative flex h-5 w-5 items-center justify-center border-2 border-black bg-white text-xs font-bold text-blue-700">
            <span className="absolute right-0 top-0 h-1.5 w-1.5 bg-blue-600 [clip-path:polygon(0_0,100%_0,100%_100%)]" />
            R
          </span>
          Revealed
        </li>
      </ul>
    </div>
  );
}
