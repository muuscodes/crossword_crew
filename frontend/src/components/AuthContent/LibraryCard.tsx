import Logo from "../../img/favicon.jpg";
import type { LibraryCardProps } from "../utils/types";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function LibraryCard(props: LibraryCardProps) {
  const { globalUser } = useAuth();
  const { author, name, date, completed, gridId } = props;
  return (
    <div
      className="flex flex-col items-center border-2 p-5 w-90 h-auto bg-black text-white hover:scale-105 focus:scale-105 shadow-2xl"
      tabIndex={0}
    >
      <Link
        to={
          author === globalUser.username
            ? `/editor/${gridId}`
            : `/solver/${gridId}`
        }
        target="_self"
        id="library-logo"
        aria-label="Crossword crew library page"
        className="block h-auto"
        tabIndex={-1}
      >
        <img src={Logo} alt="Crossword Crew Logo" className="w-2/3 m-auto" />
        <div className="items-left mt-2">
          <p className="m-2">
            <span className="bg-white text-black p-0.5">Created by</span>{" "}
            {author}
          </p>
          <p className="m-2">
            <span className="bg-white text-black p-0.5">Puzzle Title</span>{" "}
            {name}
          </p>
          <p className="m-2">
            <span className="bg-white text-black p-0.5">Created on</span> {date}
          </p>
          <p className="m-2">
            <span className="bg-white text-black p-0.5">Completion status</span>{" "}
            {completed ? "Completed" : "Unsolved"}
          </p>
        </div>
      </Link>
    </div>
  );
}
