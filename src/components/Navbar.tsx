import { useState } from "react";

export default function Navbar(props: any) {
  const { setShowModal } = props;
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 bg-black text-white z-10 flex justify-between items-center">
      <h1 className="font-extrabold md:text-4xl p-4">Crossword Community</h1>
      <section>
        <button
          className="md:hidden text-3xl cursor-pointer"
          onClick={toggleMenu}
        >
          &#9776;
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="self-end p-3 mr-5 text-2xl text-white hover:opacity-50 hover:text-red"
        >
          Sign In
        </button>
      </section>
    </header>
  );
}
