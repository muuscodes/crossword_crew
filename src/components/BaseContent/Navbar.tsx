import { useState } from "react";
import favicon from "../../img/favicon.jpg";

export default function Navbar(props: any) {
  const { setShowModal, isAuthenticated } = props;
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const landingButton = (
    <button
      onClick={() => setShowModal(true)}
      className="p-3 mr-5 lg:text-3xl text-xl text-white hover:opacity-50 hover:text-red navbar"
    >
      Sign In | Sign Up
    </button>
  );

  const createMenuNavLink = (href: string, value: string) => {
    return (
      <a
        href={href}
        target="_self"
        id={value}
        key={value}
        aria-label={value + " page"}
        className={`text-white hover:scale-120 ${
          isMenuOpen
            ? "text-6xl w-full text-center py-8 hover:opacity-50"
            : "text-3xl pr-5 hover:cursor-pointer hover:opacity-50"
        }`}
      >
        {value}
      </a>
    );
  };

  return (
    <header className=" bg-black text-white z-10">
      <section className="p-4 flex justify-between items-center">
        <div>
          <a
            href="/"
            target="_self"
            id="home-logo"
            aria-label="Crossword crew home page"
          >
            <img
              src={favicon}
              alt="Crossword 3D image"
              className="navbar inline ml-2"
            />
          </a>

          <a
            href="/"
            target="_self"
            id="home-words"
            aria-label="Crossword crew home page"
          >
            <h1 className="font-extrabold text-2xl lg:text-4xl inline">
              Crossword Crew
            </h1>
          </a>
        </div>
        {isAuthenticated ? (
          <div>
            <button
              className="lg:hidden text-4xl cursor-pointer pr-5 justify-end"
              onClick={toggleMenu}
            >
              &#9776;
            </button>
            <nav className="hidden lg:flex pr-5">
              {createMenuNavLink("/", "Home")}
              {createMenuNavLink("/create", "Create")}
              {createMenuNavLink("/library", "Library")}
              {createMenuNavLink("/contact", "Contact")}
            </nav>
          </div>
        ) : (
          landingButton
        )}
      </section>
      <section
        className={`absolute top-0 bg-black z-100 w-full text-5xl flex-col justify-center origin-top animateMenu ${
          isMenuOpen ? "flex" : "hidden"
        }`}
      >
        <button onClick={toggleMenu} className="text-8xl self-end px-6">
          &times;
        </button>
        <nav
          className="flex flex-col min-h-screen items-center py-8"
          aria-label="mobile"
        >
          {createMenuNavLink("/", "Home")}
          <hr className="text-white w-5/6" />
          {createMenuNavLink("/create", "Create")}
          <hr className="text-white w-5/6" />
          {createMenuNavLink("/library", "Library")}
          <hr className="text-white w-5/6" />
          {createMenuNavLink("/contact", "Contact")}
        </nav>
      </section>
    </header>
  );
}
