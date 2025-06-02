import { useState } from "react";
import CreateCrossword from "./CreateCrossword";

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
        <section className="min-h-screen hero">
          {/* <h1 className="text-7xl font-extrabold p-6 text-black bg-red-700 rounded-3xl text-nowrap w-4/5 m-auto">
            Welcome to Crossword Community
          </h1> */}
        </section>
        <section className="bg-gray-200 w-1/1">
          {/* <hr className="mx-auto bg-black dark:bg-white border-2 w-1/2" /> */}
          <hr className="border-4" />
          <h2 className="font-bold text-6xl pt-30">
            What Crossword Community Offers:
          </h2>
          <section className="flex flex-col md:flex-row justify-between items-center pl-30 pr-30 mt-50 mb-50">
            <h3 className="text-4xl font-bold">
              Create crosswords using an interactive grid:
            </h3>
            <div
              className="crosswordGridContainer"
              aria-label="crossword graphic"
            >
              {createDemoGrid()}
            </div>
          </section>
          <section className="flex flex-col md:flex-row justify-between items-center pl-30 pr-30 mt-50 pb-50">
            <h3 className="text-4xl font-bold">Edit hints with ease:</h3>
            <div className="border-2 rounded-sm p-2 m-2 bg-white min-w-50">
              <h4 className="font-bold">Across:</h4>
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
            <div className="border-2 rounded-sm p-2 m-2 bg-white min-w-50">
              <h4 className="font-bold">Down:</h4>
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
          </section>
        </section>
      </section>
    </>
  );
}
