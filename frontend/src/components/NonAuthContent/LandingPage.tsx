import editClues from "../../img/edit-clues.jpeg";
import editHints from "../../img/edit-hints.jpg";
import shareCw from "../../img/share-cw.jpg";
import LandingCrossword from "./LandingCrossword";

export default function LandingPage() {
  const createClue = (id: string, entry: string) => (
    <li className="flex items-center">
      <p className="font-extrabold mr-2">{id}</p>
      <textarea
        id={id}
        cols={30}
        rows={1}
        tabIndex={0}
        defaultValue={entry}
        style={{
          resize: "none",
          fontSize: "1.25rem",
        }}
        className="w-[200px]"
        onChange={(e) => {
          const target = e.target;
          target.style.height = "auto";
          const newHeight = Math.min(target.scrollHeight, 48);
          target.style.height = `${newHeight}px`;
        }}
      ></textarea>
    </li>
  );

  return (
    <>
      <section className="text-center items-center m-auto">
        <section className="hero">
          <h1 className=" text-4xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold p-6 text-white bg-black m-auto mt-50 w-fit">
            Welcome to <span className="text-nowrap">Crossword Crew</span>
          </h1>
        </section>
        <section className="w-full">
          <hr className="border-4" />
          <section className="flex flex-row justify-between items-center bg-gray-200 pt-10 pb-10 lg:pt-0 lg:pb-0">
            <div className="flex-co">
              <h3 className="text-5xl font-bold m-auto p-10">
                Create crosswords using an interactive grid:
              </h3>
              <div
                aria-label="crossword graphic"
                className="pb-10 flex justify-center"
              >
                <LandingCrossword />
              </div>
            </div>
            <img
              src={editClues}
              alt="Crossword 3D image"
              className="border-l-4 hidden lg:block w-1/2"
            />
          </section>
          <hr className="border-3" />
          <section className="flex flex-row justify-between items-center bg-gray-200 pt-10 pb-10 lg:pt-0 lg:pb-0">
            <img
              src={editHints}
              alt="Crossword 3D image"
              className="border-r-4 hidden lg:block"
            />
            <div className="flex-col w-full">
              <h3 className="text-5xl font-bold m-atuo pb-15">
                Edit hints with ease:
              </h3>
              <div className="border-2 rounded-sm p-2 mb-2 bg-white w-2/3 md:w-1/3 lg:w-2/3 xl:w-2/5 m-auto flex-col items-center">
                <h4 className="font-bold text-3xl">Across:</h4>
                <ol className="mt-3">
                  {createClue("1", "The man with a cane")}
                  {createClue("2", "Banana split?")}
                  {createClue("3", "Capital of Lesotho")}
                  {createClue("4", "A funny gag")}
                  {createClue("5", "Chocolate sauce?")}
                </ol>
              </div>
            </div>
          </section>
          <hr className="border-3 " />
          <section className="flex flex-row justify-between items-center text-center bg-gray-200 pt-10 pb-10 lg:pt-0 lg:pb-0">
            <div className="w-full lg:w-1/2">
              <p className="text-4xl lg:text-4xl font-bold m-auto pb-15 pt-10 justify-self-center-safe ">
                Create custom puzzles,
                <br />
                share them with your friends,
                <br />
                and much more!
              </p>
            </div>
            <img
              src={shareCw}
              alt="Crossword 3D image"
              className="border-l-4 hidden lg:block w-1/2"
            />
          </section>
        </section>
      </section>
    </>
  );
}
