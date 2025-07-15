import Logo from "../../img/favicon.jpg";
import type { LibraryCardProps } from "../utils/types";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function LibraryCard(props: LibraryCardProps) {
  const { globalUser } = useAuth();
  const { author, name, date, completed, gridId } = props;
  const isAuthor: boolean = author === globalUser.username;
  return (
    <div
      className={`flex flex-col items-center border-4 p-5 w-90 h-auto ${
        isAuthor ? "bg-black text-white" : "bg-gray-100 text-black"
      }  hover:scale-105 focus:scale-105 shadow-2xl`}
      tabIndex={0}
    >
      <Link
        to={isAuthor ? `/editor/${gridId}` : `/solver/${gridId}`}
        target="_self"
        id="library-logo"
        aria-label="Crossword crew library page"
        className="block h-auto"
        tabIndex={-1}
      >
        <img src={Logo} alt="Crossword Crew Logo" className="w-2/3 m-auto" />
        <div className="items-left mt-2">
          <p className="m-2">
            <span
              className={`p-0.5 ${
                isAuthor ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              Created by
            </span>
            {"  "}
            {author}
          </p>
          <p className="m-2">
            <span
              className={`p-0.5 ${
                isAuthor ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              Puzzle Title
            </span>
            {"  "}
            {name}
          </p>
          <p className="m-2">
            <span
              className={`p-0.5 ${
                isAuthor ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              Created on
            </span>
            {"  "}
            {date}
          </p>
          {!isAuthor && (
            <p className="m-2">
              <span
                className={`p-0.5 ${
                  isAuthor ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                Completion status
              </span>
              {"  "}
              {completed ? "Completed" : "Unsolved"}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
