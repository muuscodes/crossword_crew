import { type ReactNode, useId } from "react";
import { useInView } from "../../lib/useInView";
import { useAuthDialog } from "../BaseContent/authDialog";
import { BUTTON_PRIMARY, BUTTON_SECONDARY } from "../Common/styles";
import ClueDemo from "./ClueDemo";
import FloatingPieces, { type PieceSpec } from "./FloatingPieces";
import LandingCrossword from "./LandingCrossword";
import ShareDemo from "./ShareDemo";
import SolveDemo from "./SolveDemo";
import WordTiles from "./WordTiles";

// A softer glow behind centered text, fading out the background and any piece drifting behind it.
const GLOW =
  "before:absolute before:-inset-x-12 before:-inset-y-16 before:-z-10 before:bg-[radial-gradient(closest-side,var(--glow)_65%,transparent)]";

function SignUpButtons() {
  const openAuth = useAuthDialog();
  if (!openAuth) return null;
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <button type="button" className={BUTTON_PRIMARY} onClick={() => openAuth("signup")}>
        Get started
      </button>
      <button type="button" className={BUTTON_SECONDARY} onClick={() => openAuth("login")}>
        Log in
      </button>
    </div>
  );
}

function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="graph-paper relative isolate flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-24"
    >
      <FloatingPieces />
      <div className={`relative z-10 flex flex-col items-center [--glow:#f6f3ec] ${GLOW}`}>
        <h1 id="hero-title">
          <span className="sr-only">Crossword Crew</span>
          <WordTiles
            entries={[
              { word: "CROSSWORD", number: 1 },
              { word: "CREW", number: 2, highlight: [0, 4] },
            ]}
          />
        </h1>
        <p className="mt-10 max-w-xl px-3 text-xl text-neutral-800 sm:text-2xl">
          Build crosswords, send them to your friends, and solve the ones they make for you.
        </p>
        <SignUpButtons />
      </div>
    </section>
  );
}

interface FeatureProps {
  // Each section is labelled like a clue, such as "1 Across".
  clue: string;
  title: string;
  children: ReactNode;
  demo: ReactNode;
  // Puts the demo on the left on wide screens, so sections zigzag down the page.
  demoFirst?: boolean;
  paper?: boolean;
}

function Feature({ clue, title, children, demo, demoFirst = false, paper = false }: FeatureProps) {
  const headingId = useId();
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <section
      aria-labelledby={headingId}
      className={`overflow-hidden px-4 py-20 sm:px-6 lg:py-28 ${paper ? "graph-paper" : "bg-white"}`}
    >
      {/* Slides up into place the first time it scrolls into view. */}
      <div
        ref={ref}
        className={`mx-auto grid max-w-6xl items-center gap-12 motion-safe:transition motion-safe:duration-700 motion-safe:ease-out lg:grid-cols-2 lg:gap-16 ${
          inView ? "opacity-100" : "opacity-0 motion-safe:translate-y-8"
        }`}
      >
        <div className={`text-left ${demoFirst ? "lg:order-2" : ""}`}>
          <p className="inline-block border-2 border-black bg-yellow-200 px-3 py-1 text-base font-bold uppercase tracking-wider shadow-[3px_3px_0_0_#000]">
            {clue}
          </p>
          <h2 id={headingId} className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {title}
          </h2>
          <div className="mt-5 flex flex-col gap-4 text-xl leading-relaxed text-neutral-700">{children}</div>
        </div>
        <div className="flex justify-center">{demo}</div>
      </div>
    </section>
  );
}

const CLOSING_PIECES: PieceSpec[] = [
  { rows: ["FUN"], x: 10, y: 16, rotate: -10 },
  { rows: ["I"], x: 34, y: 9, rotate: -14, tint: "blue", wide: true },
  { rows: [".#", ".."], x: 88, y: 18, rotate: 10 },
  { rows: ["Y"], x: 5, y: 60, rotate: 12, tint: "yellow", wide: true },
  { rows: ["P", "L", "A", "Y"], x: 95, y: 62, rotate: -8, wide: true },
  { rows: ["#"], x: 22, y: 86, rotate: 14, scale: 0.8 },
  { rows: ["S", "#"], x: 60, y: 91, rotate: 6, wide: true },
  { rows: ["#"], x: 80, y: 85, rotate: -18 },
];

function ClosingCall() {
  return (
    <section
      aria-labelledby="closing-title"
      className="relative isolate flex min-h-[70svh] flex-col items-center justify-center overflow-hidden bg-white px-4 py-24"
    >
      <FloatingPieces pieces={CLOSING_PIECES} />
      <div className={`relative z-10 flex flex-col items-center [--glow:#fff] ${GLOW}`}>
        <h2 id="closing-title">
          <span className="sr-only">Your turn</span>
          <WordTiles entries={[{ word: "YOUR#TURN", highlight: [5, 9] }]} />
        </h2>
        <p className="mt-10 max-w-xl px-3 text-xl text-neutral-800 sm:text-2xl">
          Make your first puzzle and send it to a friend.
        </p>
        <SignUpButtons />
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="text-center">
      <Hero />
      <Feature clue="1 Across" title="Build a grid" demo={<LandingCrossword />}>
        <p>
          Pick a size from 5x5 up to 15x15, then pick squares to turn them black. The clue numbers sort
          themselves out as you go.
        </p>
        <p>Try it on this one. Symmetry is on, the way most published crosswords are built.</p>
      </Feature>
      <Feature clue="2 Down" title="Write the clues" demo={<ClueDemo />} demoFirst paper>
        <p>
          Every clue sits beside its number. Pick one and its squares light up in the grid, so you
          always know which answer you're writing for.
        </p>
        <p>Select a square, select it again to switch direction, or rewrite any of these clues.</p>
      </Feature>
      <Feature clue="3 Across" title="Share with your crew" demo={<ShareDemo />}>
        <p>
          Search for a friend's username and send them your puzzle. They get a blank copy to solve, and
          the answers never leave the server.
        </p>
        <p>Your Connections page keeps track of who you've traded puzzles with.</p>
      </Feature>
      <Feature clue="4 Down" title="Solve anywhere" demo={<SolveDemo />} demoFirst paper>
        <p>
          On a phone, a keyboard made for crosswords keeps the grid still while you type. On a computer,
          the arrow keys, Tab and Space get you around.
        </p>
        <p>Stuck? Check a square, a word or the whole puzzle, or reveal an answer.</p>
      </Feature>
      <ClosingCall />
    </div>
  );
}
