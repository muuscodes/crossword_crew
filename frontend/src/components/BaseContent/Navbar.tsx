import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/auth";

const LINKS = [
  { to: "/create", label: "Create" },
  { to: "/library", label: "Library" },
  { to: "/connections", label: "Connections" },
  { to: "/feedback", label: "Feedback" },
  { to: "/settings", label: "Settings" },
];

// Square tiles, like everything else. The page you're on is yellow, like the selected square.
const FOCUS = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cursor";
const TILE = `cursor-pointer border-2 px-3.5 py-1 font-bold transition-colors ${FOCUS}`;
const DESKTOP_LINK = (isActive: boolean) =>
  `${TILE} text-lg ${isActive ? "border-cursor bg-cursor text-black" : "border-transparent text-white/85 hover:border-white hover:text-white"}`;
const MOBILE_LINK = (isActive: boolean) =>
  `border-2 px-4 py-3 text-3xl font-bold ${FOCUS} ${isActive ? "border-cursor bg-cursor text-black" : "border-transparent text-white hover:border-white"}`;
const ICON_BUTTON = `flex h-11 w-11 cursor-pointer items-center justify-center border-2 border-transparent text-2xl hover:border-white ${FOCUS}`;

// "CC" in two squares, highlighted like a word being typed.
function BrandMark() {
  const square = "flex h-8 w-8 items-center justify-center border-2 border-white text-lg font-extrabold text-black";
  return (
    <span aria-hidden="true" className="flex">
      <span className={`${square} bg-cursor`}>C</span>
      <span className={`${square} -ml-0.5 bg-blue-200`}>C</span>
    </span>
  );
}

interface NavbarProps {
  onLogIn: () => void;
  onSignUp: () => void;
}

export default function Navbar({ onLogIn, onSignUp }: NavbarProps) {
  const { status, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const isAuthenticated = status === "authenticated";

  // While the full-screen mobile menu is open, the page behind it shouldn't scroll.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout().catch(() => {});
    navigate("/");
  };

  return (
    <header className="z-10 bg-black text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to={isAuthenticated ? "/home" : "/"}
          aria-label="Crossword Crew home"
          className={`flex items-center gap-3 ${FOCUS}`}
        >
          <BrandMark />
          <span className="hidden text-2xl font-extrabold tracking-tight sm:inline">Crossword Crew</span>
        </Link>

        {isAuthenticated && (
          <>
            <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
              {LINKS.map(({ to, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => DESKTOP_LINK(isActive)}>
                  {label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className={`${TILE} ml-2 border-white text-lg hover:bg-white hover:text-black`}
              >
                Log out
              </button>
            </nav>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className={`${ICON_BUTTON} lg:hidden`}
              onClick={() => setMenuOpen(true)}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </>
        )}

        {status === "unauthenticated" && (
          <div className="flex items-center gap-2">
            <button type="button" onClick={onLogIn} className={`${TILE} border-transparent text-white hover:border-white`}>
              Log in
            </button>
            <button type="button" onClick={onSignUp} className={`${TILE} border-cursor bg-cursor text-black hover:border-white hover:bg-white`}>
              Sign up
            </button>
          </div>
        )}
      </div>

      {isAuthenticated && menuOpen && (
        <div id="mobile-menu" className="animateMenu fixed inset-0 z-100 flex flex-col overflow-y-auto bg-black px-4 pb-10 sm:px-6">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <span className="text-2xl font-extrabold tracking-tight">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              autoFocus
              className={ICON_BUTTON}
              onClick={() => setMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <nav aria-label="Mobile" className="mt-4 flex flex-col gap-1">
            {[{ to: "/home", label: "Home" }, ...LINKS].map(({ to, label }) => (
              <NavLink key={to} to={to} className={({ isActive }) => MOBILE_LINK(isActive)} onClick={() => setMenuOpen(false)}>
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className={`mt-6 cursor-pointer border-2 border-white px-4 py-3 text-2xl font-bold hover:bg-white hover:text-black ${FOCUS}`}
            >
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
