import { Link } from "react-router";
import { useAuth } from "../../context/auth";

const LINK = "underline underline-offset-2 hover:text-cursor";

export default function Footer() {
  const { status } = useAuth();
  return (
    <footer className="bg-black px-4 py-4 text-center text-white">
      <p>
        &copy; 2025 Muuscodes | Open source under the{" "}
        <a
          href="https://github.com/muuscodes/crossword_crew/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          className={LINK}
        >
          MIT License
        </a>
        {status === "authenticated" && (
          <>
            {" "}
            | Found a bug?{" "}
            <Link to="/feedback" className={LINK}>
              Send feedback
            </Link>
          </>
        )}
      </p>
    </footer>
  );
}
