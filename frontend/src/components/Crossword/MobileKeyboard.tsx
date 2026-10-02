import { faChevronDown, faDeleteLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type PointerEvent, type ReactNode, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { CrosswordModel } from "../../lib/useCrossword";
import ClueBar from "./ClueBar";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

// Keys keep focus in the grid and never select text. Pressing happens on click, so a finger that
// slides off a key cancels it.
const keepGridFocus = (event: PointerEvent) => event.preventDefault();

function Key({ label, onPress, wide = false, children }: { label: string; onPress: () => void; wide?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={keepGridFocus}
      onClick={onPress}
      className={`flex h-12 min-w-0 cursor-pointer items-center justify-center rounded-md bg-white font-bold text-black shadow-[0_1px_0_rgba(0,0,0,0.35)] active:bg-neutral-300 ${
        wide ? "flex-[1.6] text-sm" : "flex-1 text-xl"
      }`}
    >
      {children}
    </button>
  );
}

// The on-screen keyboard for touch devices. It replaces the phone's own keyboard, which resizes the
// page and scrolls it on every letter. While it's open, the page gets room at the bottom so nothing
// ends up hidden behind it.
export default function MobileKeyboard({ crossword }: { crossword: CrosswordModel }) {
  const { state, dispatch } = crossword;
  const panelRef = useRef<HTMLDivElement>(null);
  const direction = state.selection?.direction ?? "across";

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const root = document.documentElement;
    const previousPadding = document.body.style.paddingBottom;
    const reserveSpace = () => {
      const height = `${panel.offsetHeight}px`;
      root.style.setProperty("--keyboard-height", height);
      document.body.style.paddingBottom = height;
    };
    reserveSpace();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(reserveSpace) : null;
    observer?.observe(panel);
    return () => {
      observer?.disconnect();
      root.style.removeProperty("--keyboard-height");
      document.body.style.paddingBottom = previousPadding;
    };
  }, []);

  return createPortal(
    <div
      ref={panelRef}
      role="group"
      aria-label="Crossword keyboard"
      className="fixed inset-x-0 bottom-0 z-40 select-none bg-neutral-300 px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.2)]"
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
    >
      <div className="mx-auto flex max-w-xl flex-col gap-1.5">
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <ClueBar crossword={crossword} compact />
          </div>
          <button
            type="button"
            aria-label="Hide keyboard"
            onPointerDown={keepGridFocus}
            onClick={() => dispatch({ type: "clearSelection" })}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-white text-lg active:bg-neutral-300"
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
        </div>
        {ROWS.map((row, rowIndex) => (
          <div key={row} className={`flex gap-1 ${rowIndex === 1 ? "px-[5%]" : ""}`}>
            {rowIndex === 2 && (
              <Key
                label={`Typing ${direction}. Switch to ${direction === "across" ? "down" : "across"}`}
                onPress={() => dispatch({ type: "toggleDirection" })}
                wide
              >
                {direction === "across" ? "Across" : "Down"}
              </Key>
            )}
            {[...row].map((letter) => (
              <Key key={letter} label={letter} onPress={() => dispatch({ type: "input", key: letter })}>
                {letter}
              </Key>
            ))}
            {rowIndex === 2 && (
              <Key label="Backspace" onPress={() => dispatch({ type: "backspace" })} wide>
                <FontAwesomeIcon icon={faDeleteLeft} className="text-xl" />
              </Key>
            )}
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
