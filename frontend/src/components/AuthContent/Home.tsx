import { faArrowRight, faBookOpen, faPaperPlane, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/auth";
import { apiRequest, errorMessage } from "../../lib/api";
import PageHeader from "../Common/PageHeader";
import StatusMessage from "../Common/StatusMessage";
import { BUTTON_PRIMARY, BUTTON_SECONDARY, CARD, CARD_LINK } from "../Common/styles";
import type { Stats } from "../utils/types";
import type { LibrarySort } from "./Library";

// Each stat gets a colored square, like the squares of a grid.
const STAT_CARDS: { key: keyof Stats; label: string; sort: LibrarySort; square: string }[] = [
  { key: "total", label: "Puzzles in your library", sort: "dateNewest", square: "bg-white" },
  { key: "created", label: "Puzzles you made", sort: "created", square: "bg-cursor" },
  { key: "received", label: "Puzzles shared with you", sort: "received", square: "bg-blue-200" },
  { key: "solved", label: "Puzzles solved", sort: "completed", square: "bg-black text-white" },
];

const STAT_CARD = `${CARD} flex h-full flex-col p-5`;

interface StatCardProps {
  count: number | undefined;
  label: string;
  square: string;
  to: string | null;
}

function StatCard({ count, label, square, to }: StatCardProps) {
  const content: ReactNode = (
    <>
      {count === undefined ? (
        <span className="block h-16 w-16 animate-pulse border-2 border-black bg-neutral-200">
          <span className="sr-only">Loading</span>
        </span>
      ) : (
        <span
          className={`flex h-16 min-w-16 items-center justify-center self-start border-2 border-black px-2 text-4xl font-extrabold tabular-nums ${square}`}
        >
          {count}
        </span>
      )}
      <span className="mt-3 text-base font-bold text-neutral-700 sm:text-lg">{label}</span>
      {to && (
        <span className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-bold">
          View <FontAwesomeIcon icon={faArrowRight} />
        </span>
      )}
    </>
  );
  // Only link to the library when there's something to see.
  return to ? (
    <Link to={to} className={`${STAT_CARD} ${CARD_LINK}`}>
      {content}
    </Link>
  ) : (
    <div className={STAT_CARD}>{content}</div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Set when another page sent the person here, such as a puzzle link that isn't theirs.
  const passedNotice = (location.state as { notice?: string } | null)?.notice ?? null;
  const [notice, setNotice] = useState(passedNotice);

  // The notice has been picked up; drop it from history so a reload doesn't show it again.
  useEffect(() => {
    if (passedNotice) navigate(location.pathname, { replace: true, state: null });
  }, [passedNotice, location.pathname, navigate]);

  useEffect(() => {
    let cancelled = false;
    apiRequest<Stats>("/users/me/stats")
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch((requestError) => {
        if (!cancelled) setError(errorMessage(requestError));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">
      {notice && (
        <div role="status" className="mb-8 flex items-start gap-3 border-2 border-black bg-cursor p-4 text-lg shadow-tile">
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setNotice(null)}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-2 border-transparent hover:border-black"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
      )}
      <PageHeader label="Home" title={`Welcome back, ${user?.username ?? ""}`}>
        <p>Pick up where you left off, or start something new.</p>
      </PageHeader>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link to="/create" className={BUTTON_PRIMARY}>
          <FontAwesomeIcon icon={faPlus} /> Create a puzzle
        </Link>
        <Link to="/library" className={BUTTON_SECONDARY}>
          <FontAwesomeIcon icon={faBookOpen} /> Open library
        </Link>
        <Link to="/connections" className={BUTTON_SECONDARY}>
          <FontAwesomeIcon icon={faPaperPlane} /> Send a puzzle
        </Link>
      </div>

      <section aria-labelledby="stats-heading" className="mt-12">
        <h2 id="stats-heading" className="text-3xl font-extrabold tracking-tight">
          Your stats
        </h2>
        {error && <StatusMessage status={{ tone: "error", text: error }} className="mt-2" />}
        <ul className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {STAT_CARDS.map(({ key, label, sort, square }) => {
            const count = stats?.[key];
            return (
              <li key={key}>
                <StatCard count={count} label={label} square={square} to={count ? `/library?sort=${sort}` : null} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
