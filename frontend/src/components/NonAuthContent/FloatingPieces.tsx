import { type CSSProperties, useEffect, useRef } from "react";
import { useMediaQuery } from "../../lib/useMediaQuery";

export interface PieceSpec {
  // One string per row: "#" is a black square, "." an empty white one, " " no square at all, and
  // anything else a letter.
  rows: string[];
  // Resting place, as a percentage of the hero's width and height.
  x: number;
  y: number;
  rotate: number;
  scale?: number;
  // Colors the white squares like the selected square (yellow) or word (blue) in the app.
  tint?: "yellow" | "blue";
  // Only shown on wider screens, where there's room beside the title.
  wide?: boolean;
}

// The hero's pieces, kept around the edges so the title stays readable.
const HERO_PIECES: PieceSpec[] = [
  { rows: ["CAT"], x: 9, y: 10, rotate: -12 },
  { rows: ["#"], x: 22, y: 21, rotate: 10, scale: 0.8, wide: true },
  { rows: ["Q"], x: 31, y: 8, rotate: 14, tint: "yellow" },
  { rows: [".#", "A."], x: 45, y: 15, rotate: -8, wide: true },
  { rows: ["S", "U", "N"], x: 59, y: 10, rotate: 9 },
  { rows: ["#.#", "...", "#.#"], x: 75, y: 14, rotate: -14, scale: 0.85 },
  { rows: ["Z"], x: 89, y: 7, rotate: 18, tint: "blue" },
  { rows: ["WORD"], x: 94, y: 25, rotate: 8, wide: true },
  { rows: ["E#", ".X"], x: 6, y: 38, rotate: 10, wide: true },
  { rows: ["#"], x: 14, y: 53, rotate: -20, scale: 0.7, wide: true },
  { rows: ["P", "#", "."], x: 5, y: 68, rotate: -6, wide: true },
  { rows: ["..", "#."], x: 92, y: 45, rotate: -10, tint: "blue", wide: true },
  { rows: ["K"], x: 86, y: 60, rotate: 12, wide: true },
  { rows: ["#", "#"], x: 96, y: 72, rotate: 22, scale: 0.8, wide: true },
  { rows: ["CLUE"], x: 13, y: 89, rotate: 7 },
  { rows: ["#"], x: 27, y: 80, rotate: -14, wide: true },
  { rows: ["..#", ".A.", "#.."], x: 37, y: 92, rotate: -10, scale: 0.85 },
  { rows: ["J"], x: 51, y: 84, rotate: 16, tint: "yellow" },
  { rows: ["G", "R", "I", "D"], x: 63, y: 93, rotate: -5, wide: true },
  { rows: ["#.", ".#"], x: 76, y: 84, rotate: 12 },
  { rows: ["O"], x: 89, y: 91, rotate: -18 },
  { rows: ["A"], x: 97, y: 85, rotate: 8, scale: 0.8, wide: true },
];

// How the pieces react. Distances are in pixels and speeds in pixels per frame at 60fps.
const PUSH_RADIUS = 170; // how close the pointer gets before a piece starts to move away
const PUSH_STRENGTH = 3;
const TAP_RADIUS = 260; // a click or tap knocks nearby pieces away in one go
const TAP_STRENGTH = 20;
const SPRING = 0.012; // pull back to the resting place
const DAMPING = 0.9; // share of speed kept each frame
const SPIN = 0.5; // how much a push turns a piece

const TINTS = { yellow: "bg-yellow-200", blue: "bg-blue-200" };

const restingTransform = (piece: PieceSpec) => `translate(-50%, -50%) rotate(${piece.rotate}deg)`;

interface Body {
  element: HTMLElement;
  piece: PieceSpec;
  // Bigger pieces are harder to push.
  weight: number;
  phase: number;
  homeX: number;
  homeY: number;
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  vspin: number;
}

interface Point {
  x: number;
  y: number;
}

// Moves a piece away from a point, harder the closer it is, like magnets with the same pole. A
// pointer that stays put holds nearby pieces at a distance instead of sitting on top of them.
function pushAway(body: Body, from: Point, centerX: number, centerY: number, radius: number, strength: number) {
  const dx = centerX - from.x;
  const dy = centerY - from.y;
  const distance = Math.hypot(dx, dy) || 0.001;
  const reach = radius + body.radius;
  if (distance >= reach) return;
  const force = (strength * (1 - distance / reach)) / body.weight;
  body.vx += (dx / distance) * force;
  body.vy += (dy / distance) * force;
  body.vspin += (dx / distance) * force * SPIN;
}

function Piece({ piece, pieceRef }: { piece: PieceSpec; pieceRef: (element: HTMLDivElement | null) => void }) {
  const columns = Math.max(...piece.rows.map((row) => row.length));
  const square = `calc(var(--piece-square) * ${piece.scale ?? 1})`;
  return (
    <div
      ref={pieceRef}
      className={`absolute will-change-transform ${piece.wide ? "hidden sm:block" : ""}`}
      style={{ left: `${piece.x}%`, top: `${piece.y}%`, transform: restingTransform(piece) }}
    >
      <div
        className="grid drop-shadow-[3px_4px_0_rgb(0_0_0/0.18)]"
        style={{ gridTemplateColumns: `repeat(${columns}, ${square})`, gridAutoRows: square }}
      >
        {piece.rows.flatMap((row, rowIndex) =>
          [...row.padEnd(columns)].map((cell, column) => {
            const key = `${rowIndex}-${column}`;
            if (cell === " ") return <span key={key} />;
            const color = cell === "#" ? "bg-black" : piece.tint ? TINTS[piece.tint] : "bg-white";
            return (
              <span
                key={key}
                className={`flex items-center justify-center font-extrabold leading-none ${color}`}
                // An outline on every side of every square, so shared edges are as thin as outer ones.
                style={{ outline: "2px solid black", outlineOffset: "-1px", fontSize: `calc(${square} * 0.6)` }}
              >
                {cell === "#" || cell === "." ? "" : cell}
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}

// Crossword squares and bits of grid that float around the hero and get pushed away by the
// pointer, then drift back. They're decoration only, so screen readers skip them.
export default function FloatingPieces({ pieces = HERO_PIECES }: { pieces?: PieceSpec[] }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || reduceMotion || typeof requestAnimationFrame !== "function") return;

    const bodies: Body[] = pieceRefs.current.flatMap((element, index) => {
      if (!element) return [];
      const piece = pieces[index];
      const squares = piece.rows.join("").replaceAll(" ", "").length;
      return [{
        element,
        piece,
        weight: Math.sqrt(squares) * (piece.scale ?? 1),
        phase: index * 1.7,
        homeX: 0,
        homeY: 0,
        radius: 0,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        spin: 0,
        vspin: 0,
      }];
    });

    const measure = () => {
      const { width, height } = layer.getBoundingClientRect();
      for (const body of bodies) {
        body.homeX = (body.piece.x / 100) * width;
        body.homeY = (body.piece.y / 100) * height;
        body.radius = Math.max(body.element.offsetWidth, body.element.offsetHeight) / 2;
      }
    };
    measure();
    const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    resizeObserver?.observe(layer);

    // Where the pointer is, relative to the hero, or null when there's nothing to dodge.
    let pointer: Point | null = null;
    let tap: Point | null = null;
    const toLayer = (event: PointerEvent): Point => {
      const box = layer.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    };
    const onMove = (event: PointerEvent) => {
      pointer = toLayer(event);
    };
    const onDown = (event: PointerEvent) => {
      pointer = toLayer(event);
      tap = pointer;
    };
    // A finger that lifts is gone; a mouse stays where it is.
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") pointer = null;
    };
    const onLeave = () => {
      pointer = null;
    };
    const root = document.documentElement;
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", onLeave);
    root.addEventListener("pointerleave", onLeave);

    let frame = 0;
    let last = 0;
    const step = (now: number) => {
      // Frame-rate independent: a 120Hz screen takes half steps.
      const dt = last ? Math.min((now - last) / (1000 / 60), 3) : 1;
      last = now;
      const keep = DAMPING ** dt;
      for (const body of bodies) {
        // A gentle bob, so the pieces float even when nobody is near them.
        const bobX = Math.sin(now / 1700 + body.phase) * 5;
        const bobY = Math.cos(now / 2100 + body.phase * 1.3) * 8;
        const centerX = body.homeX + body.x + bobX;
        const centerY = body.homeY + body.y + bobY;
        if (pointer) pushAway(body, pointer, centerX, centerY, PUSH_RADIUS, PUSH_STRENGTH * dt);
        if (tap) pushAway(body, tap, centerX, centerY, TAP_RADIUS, TAP_STRENGTH);

        body.vx = (body.vx - body.x * SPRING * dt) * keep;
        body.vy = (body.vy - body.y * SPRING * dt) * keep;
        body.vspin = (body.vspin - body.spin * SPRING * dt) * keep;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        body.spin += body.vspin * dt;

        const angle = body.piece.rotate + body.spin + bobX * 0.4;
        body.element.style.transform = `translate(-50%, -50%) translate3d(${body.x + bobX}px, ${body.y + bobY}px, 0) rotate(${angle}deg)`;
      }
      tap = null;
      frame = requestAnimationFrame(step);
    };

    // Only animate while the hero is on screen.
    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      frame = requestAnimationFrame(step);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const visibility =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
        : null;
    if (visibility) visibility.observe(layer);
    else start();

    return () => {
      stop();
      visibility?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onLeave);
      root.removeEventListener("pointerleave", onLeave);
      for (const body of bodies) body.element.style.transform = restingTransform(body.piece);
    };
  }, [reduceMotion, pieces]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="fade-in pointer-events-none absolute inset-0 select-none"
      style={{ "--piece-square": "clamp(1.5rem, 2.8vw, 2.75rem)" } as CSSProperties}
    >
      {pieces.map((piece, index) => (
        <Piece
          key={index}
          piece={piece}
          pieceRef={(element) => {
            pieceRefs.current[index] = element;
          }}
        />
      ))}
    </div>
  );
}
