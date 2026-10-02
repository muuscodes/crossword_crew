// Shared Tailwind classes for the crossword look: black ink on graph paper, white squares with a
// black border and an offset shadow, yellow for where you are and blue for what goes with it.

const FOCUS = "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus";

// Square tiles that press into the page.
const BUTTON_BASE = `inline-flex cursor-pointer items-center justify-center gap-2 border-2 border-black px-5 py-2.5 text-lg font-bold shadow-tile transition hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:pointer-events-none disabled:opacity-60 ${FOCUS}`;

export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-black text-white hover:bg-neutral-800`;
export const BUTTON_SECONDARY = `${BUTTON_BASE} bg-white text-black hover:bg-cursor`;

// A white card: the main surface on every page.
export const CARD = "border-3 border-black bg-white shadow-card";
// The black title bar across the top of a card.
export const CARD_HEADER = "bg-black px-4 py-3 text-center text-2xl font-bold text-white";
// Cards that are links lift a little on hover.
export const CARD_LINK = `transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#000] ${FOCUS}`;

// A small label like the "1 Across" tags on the landing page.
export const CHIP = "inline-block border-2 border-black px-2.5 py-0.5 text-sm font-bold uppercase tracking-wider";
export const CHIP_YELLOW = `${CHIP} bg-cursor shadow-[2px_2px_0_0_#000]`;

// Text boxes turn yellow while you type in them, like the selected square in a grid.
export const INPUT =
  "w-full border-2 border-black bg-white px-3 py-2 text-lg text-black outline-none transition placeholder:text-neutral-400 focus:bg-yellow-50 focus:shadow-tile disabled:opacity-60";
