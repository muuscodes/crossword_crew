import Logo from "../../img/favicon.jpg";
import type { LibraryCardProps } from "../utils/types";

export default function LibraryCard(props: LibraryCardProps) {
  const { author, name, date, completed } = props;
  return (
    <div
      className="flex flex-col items-center border-2 p-5 w-90 h-auto bg-black text-white hover:scale-105 focus:scale-105 shadow-2xl"
      tabIndex={0}
    >
      <a
        href="/library"
        target="_self"
        id="library-logo"
        aria-label="Crossword crew library page"
        className="block w-2/3 h-auto"
        tabIndex={-1}
      >
        <img src={Logo} alt="Placeholder" />
      </a>
      <div className="items-left mt-2">
        <p className="m-2">
          <span className="bg-white text-black p-0.5">Created by</span> {author}
        </p>
        <p className="m-2">
          <span className="bg-white text-black p-0.5">Puzzle Title</span> {name}
        </p>
        <p className="m-2">
          <span className="bg-white text-black p-0.5">Created on</span> {date}
        </p>
        <p className="m-2">
          <span className="bg-white text-black p-0.5">Completion status</span>{" "}
          {completed ? "Completed" : "Unsolved"}
        </p>
      </div>
    </div>
  );
}
