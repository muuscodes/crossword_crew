import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "../../context/auth";
import { apiRequest, errorMessage } from "../../lib/api";
import PageHeader from "../Common/PageHeader";
import PageMessage from "../Common/PageMessage";
import { BUTTON_PRIMARY, CARD } from "../Common/styles";
import type { LibraryResponse } from "../utils/types";
import LibraryCard, { type LibraryItem } from "./LibraryCard";

const SORT_OPTIONS = {
  dateNewest: "Date: newest",
  dateOldest: "Date: oldest",
  author: "Author",
  title: "Title",
  created: "Puzzles created",
  received: "Puzzles received",
  completed: "Completion status",
} as const;

export type LibrarySort = keyof typeof SORT_OPTIONS;

const isSort = (value: string | null): value is LibrarySort => value !== null && value in SORT_OPTIONS;

const time = (item: LibraryItem) => new Date(item.createdAt).getTime();

// Newest first, then the chosen order on top (Array.prototype.sort is stable).
function sortItems(items: LibraryItem[], sort: LibrarySort): LibraryItem[] {
  const byNewest = [...items].sort((a, b) => time(b) - time(a));
  switch (sort) {
    case "dateNewest":
      return byNewest;
    case "dateOldest":
      return byNewest.reverse();
    case "author":
      return byNewest.sort((a, b) => a.author.localeCompare(b.author));
    case "title":
      return byNewest.sort((a, b) => a.title.localeCompare(b.title));
    case "created":
      return byNewest.sort((a, b) => Number(b.isOwner) - Number(a.isOwner));
    case "received":
      return byNewest.sort((a, b) => Number(a.isOwner) - Number(b.isOwner));
    case "completed":
      return byNewest.sort((a, b) => Number(Boolean(b.completed)) - Number(Boolean(a.completed)));
  }
}

function toItems(library: LibraryResponse, username: string): LibraryItem[] {
  const formatDate = (date: string) => format(new Date(date), "MMMM d, yyyy 'at' h:mm a");
  return [
    ...library.created.map((puzzle) => ({
      key: `created-${puzzle.grid_id}`,
      gridId: puzzle.grid_id,
      title: puzzle.puzzle_title || "Crossword Puzzle",
      author: username,
      createdAt: puzzle.created_at,
      formattedDate: formatDate(puzzle.created_at),
      isOwner: true,
    })),
    ...library.received.map((puzzle) => ({
      key: `received-${puzzle.grid_id}`,
      gridId: puzzle.grid_id,
      title: puzzle.puzzle_title || "Crossword Puzzle",
      author: puzzle.creator_username,
      createdAt: puzzle.created_at,
      formattedDate: formatDate(puzzle.created_at),
      isOwner: false,
      completed: puzzle.completed_status,
    })),
  ];
}

export default function Library() {
  const { user } = useAuth();
  const username = user?.username ?? "";
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSort = searchParams.get("sort");
  const sort: LibrarySort = isSort(requestedSort) ? requestedSort : "dateNewest";
  const [items, setItems] = useState<LibraryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest<LibraryResponse>("/users/me/grids")
      .then((library) => {
        if (!cancelled) setItems(toItems(library, username));
      })
      .catch((requestError) => {
        if (!cancelled) setError(errorMessage(requestError));
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const sorted = useMemo(() => (items ? sortItems(items, sort) : []), [items, sort]);

  if (error) return <PageMessage>{error}</PageMessage>;
  if (!items) return <PageMessage>Loading your library…</PageMessage>;

  const made = items.filter((item) => item.isOwner).length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:py-14">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <PageHeader label={`${items.length} ${items.length === 1 ? "puzzle" : "puzzles"}`} title="Library">
          <p>
            {made} made by you and {items.length - made} shared with you. Yours open in the editor, the rest
            are ready to solve.
          </p>
        </PageHeader>
        <label className="flex shrink-0 items-center gap-3 text-lg font-bold">
          Sort by
          <select
            className="select-chevron cursor-pointer border-2 border-black bg-white px-2 py-1.5 font-bold shadow-tile outline-none focus:bg-yellow-50"
            value={sort}
          onChange={(event) => setSearchParams({ sort: event.target.value }, { replace: true })}
        >
          {Object.entries(SORT_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
          </select>
        </label>
      </div>
      {sorted.length === 0 ? (
        <div className={`${CARD} flex flex-col items-center gap-5 p-8 text-center text-xl`}>
          <p>Your library is empty. Make your first crossword, or ask a friend to share one with you.</p>
          <Link to="/create" className={BUTTON_PRIMARY}>
            Create a puzzle
          </Link>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((item) => (
            <li key={item.key}>
              <LibraryCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
