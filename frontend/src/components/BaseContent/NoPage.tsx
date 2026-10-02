import { Link } from "react-router";
import { useAuth } from "../../context/auth";
import { BUTTON_PRIMARY } from "../Common/styles";
import WordTiles from "../NonAuthContent/WordTiles";

export default function NoPage() {
  const { status } = useAuth();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <h1>
        <span className="sr-only">Page not found!</span>
        <WordTiles entries={[{ word: "NOT#FOUND", highlight: [5, 9] }]} />
      </h1>
      <p className="max-w-md text-xl text-neutral-700">
        There's no page at this address. It may have moved, or the link has a typo.
      </p>
      <Link to={status === "authenticated" ? "/home" : "/"} className={BUTTON_PRIMARY}>
        Go to the homepage
      </Link>
    </div>
  );
}
