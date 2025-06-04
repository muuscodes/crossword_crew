import { useState } from "react";
import editClues from "../img/edit-clues.jpeg";
import editHints from "../img/edit-hints.jpg";

export default function LandingPage() {
  const [clickedCells, setClickedCells] = useState(Array(81).fill(false));

  const toggleGridClick = (index: number) => {
    const newClickedCells = [...clickedCells];
    newClickedCells[index] = !newClickedCells[index];
    setClickedCells(newClickedCells);
  };

  const createDemoGrid = () => {
    const grid = [];
    for (let i = 0; i < 81; i++) {
      grid.push(
        <div
          onClick={() => toggleGridClick(i)}
          className={`crosswordGridDivs hover:bg-gray-400 ${
            clickedCells[i] ? "bg-black" : "bg-white"
          }`}
          key={`${i}`}
        >
          {" "}
        </div>
      );
    }
    return grid;
  };

  return (
    <>
      <section className="text-center items-center m-auto">
        <section className="hero">
          <h1 className=" text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold p-6 text-white bg-black text-nowrap m-auto mt-50">
            Welcome to Crossword Crew
          </h1>
        </section>
        <section className="w-1/1">
          <hr className="border-4" />
          <section className="flex flex-row justify-between items-center bg-gray-200">
            <div className="flex-col">
              <h3 className="text-5xl font-bold pl-10 pb-15">
                Create crosswords using an interactive grid:
              </h3>
              <div
                className="crosswordGridContainer"
                aria-label="crossword graphic"
              >
                {createDemoGrid()}
              </div>
            </div>
            <img
              src={editClues}
              alt="Crossword 3D image"
              className="border-l-4"
            />
          </section>
          <hr className="border-3" />
          <section className="flex flex-row justify-between items-center bg-gray-200">
            <img
              src={editHints}
              alt="Crossword 3D image"
              className="border-r-4"
            />
            <div className="flex-col w-1/1">
              <h3 className="text-5xl font-bold pb-15">
                Edit hints with ease:
              </h3>
              <div className="border-2 rounded-sm p-2 mb-2 bg-white min-w-50 w-1/4 m-auto">
                <h4 className="font-bold text-xl">Across:</h4>
                <ol className="mt-3 list-decimal list-inside">
                  <li>
                    <textarea
                      name="across1"
                      id="across1"
                      cols={20}
                      rows={1}
                      defaultValue={"The man with a cane"}
                      style={{ resize: "none" }}
                    ></textarea>
                  </li>
                  <li>
                    <textarea
                      name="across1"
                      id="across1"
                      cols={20}
                      rows={1}
                      defaultValue={"Banana split?"}
                      style={{ resize: "none" }}
                    ></textarea>
                  </li>
                  <li>
                    <textarea
                      name="across1"
                      id="across1"
                      cols={20}
                      rows={1}
                      style={{ resize: "none" }}
                      defaultValue={"Capital of Lesotho"}
                    ></textarea>
                  </li>
                  <li>
                    <textarea
                      name="across1"
                      id="across1"
                      cols={20}
                      rows={1}
                      style={{ resize: "none" }}
                      defaultValue={"A funny gag"}
                    ></textarea>
                  </li>
                </ol>
              </div>
              <div className="border-2 rounded-sm p-2 mb-2 bg-white min-w-50 w-1/4 m-auto">
                <h4 className="font-bold text-xl">Down:</h4>
                <ol className="mt-3 list-decimal list-inside">
                  <li>
                    <textarea
                      name="across1"
                      id="across1"
                      cols={20}
                      rows={1}
                      style={{ resize: "none" }}
                      defaultValue={"Pi day?"}
                    ></textarea>
                  </li>
                  <li>
                    <textarea
                      name="across1"
                      id="across1"
                      cols={20}
                      rows={1}
                      style={{ resize: "none" }}
                      defaultValue={"A common occurrence"}
                    ></textarea>
                  </li>
                  <li>
                    <textarea
                      name="across1"
                      id="across1"
                      cols={20}
                      rows={1}
                      style={{ resize: "none" }}
                      defaultValue={"Cheese"}
                    ></textarea>
                  </li>
                  <li>
                    <textarea
                      name="across1"
                      id="across1"
                      cols={20}
                      rows={1}
                      style={{ resize: "none" }}
                      defaultValue={"Hello World!"}
                    ></textarea>
                  </li>
                </ol>
              </div>
            </div>
          </section>
          <hr className="border-3" />
          <section className="flex flex-row justify-between items-center bg-gray-200">
            <div className="flex-col">
              <h3 className="text-5xl font-bold pl-10 pb-15">
                Share custom puzzles with your friends:
              </h3>
              <div
                className="crosswordGridContainer"
                aria-label="crossword graphic"
              >
                {createDemoGrid()}
              </div>
            </div>
            <img
              src={editClues}
              alt="Crossword 3D image"
              className="border-l-4"
            />
          </section>
        </section>
      </section>
    </>
  );
}
