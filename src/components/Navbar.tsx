import { useState } from "react";
import favicon from "../img/favicon.jpg";

export default function Navbar(props: any) {
  const { setShowModal } = props;
  // const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // const toggleMenu = () => {
  //   setIsMenuOpen(!isMenuOpen);
  // };

  return (
    <header className=" bg-black text-white z-10 flex justify-between items-center">
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

        {/* <h1 className="font-extrabold md:text-4xl p-4 inline">
          Crossword Crew
        </h1> */}
        <a
          href="/"
          target="_self"
          id="home-words"
          aria-label="Crossword crew home page"
        >
          <h1 className="font-extrabold md:text-4xl inline">Crossword Crew</h1>
        </a>
      </div>
      <section>
        {/* <button
          className="md:hidden text-3xl cursor-pointer"
          onClick={toggleMenu}
        >
          &#9776;
        </button> */}
        <button
          onClick={() => setShowModal(true)}
          className="self-end p-3 mr-5 text-2xl text-white hover:opacity-50 hover:text-red navbar"
        >
          Sign In | Sign Up
        </button>
      </section>
    </header>
  );
}
