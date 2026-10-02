import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import { CARD, CARD_LINK, CHIP } from "../Common/styles";

export interface LibraryItem {
  key: string;
  gridId: number;
  title: string;
  author: string;
  createdAt: string;
  formattedDate: string;
  // The logged-in user made this puzzle (so it opens in the editor rather than the solver).
  isOwner: boolean;
  completed?: boolean;
}

// The whole card is one link, so it works with the keyboard and screen readers. The square with the
// title's first letter is yellow for your own puzzles and blue for ones shared with you.
export default function LibraryCard({ item }: { item: LibraryItem }) {
  const { gridId, title, author, formattedDate, isOwner, completed } = item;
  const initial = [...title.trim()][0]?.toLocaleUpperCase() ?? "?";
  const status = isOwner
    ? { text: "Yours", className: "bg-cursor" }
    : completed
      ? { text: "Solved", className: "bg-black text-white" }
      : { text: "Unsolved", className: "bg-white" };

  return (
    <Link
      to={isOwner ? `/editor/${gridId}` : `/solver/${gridId}`}
      aria-label={`${isOwner ? "Edit" : "Solve"} ${title}`}
      className={`${CARD} ${CARD_LINK} flex h-full flex-col gap-4 p-5 text-left`}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className={`flex h-14 w-14 shrink-0 items-center justify-center border-2 border-black text-3xl font-extrabold ${
            isOwner ? "bg-cursor" : "bg-blue-200"
          }`}
        >
          {initial}
        </span>
        <div className="min-w-0">
          <p className="break-words text-2xl font-extrabold leading-tight">{title}</p>
          <p className="mt-1 text-neutral-600">{isOwner ? "Made by you" : `By ${author}`}</p>
        </div>
      </div>
      <p className="text-neutral-700">
        {isOwner ? "Created" : "Received"} {formattedDate}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3">
        <span className={`${CHIP} ${status.className}`}>{status.text}</span>
        <span className="flex items-center gap-2 font-bold">
          {isOwner ? "Edit" : "Solve"}
          <FontAwesomeIcon icon={faArrowRight} />
        </span>
      </div>
    </Link>
  );
}
