// import { useState } from "react";
import editClues from "../../img/edit-clues.jpeg";
import editHints from "../../img/edit-hints.jpg";
import shareCw from "../../img/share-cw.jpg";
import CrosswordGrid from "../BuildCrossword/CrosswordGrid";

export default function LandingPage() {
  const createHint = (name: string, id: string, value: string) => {
    return (
      <li>
        <textarea
          name={name}
          id={id}
          cols={20}
          rows={1}
          defaultValue={value}
          style={{ resize: "none" }}
        ></textarea>
      </li>
    );
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
          <section className="flex flex-row justify-between items-center bg-gray-200 pt-10 pb-10 lg:pt-0 lg:pb-0">
            <div className="flex-col">
              <h3 className="text-5xl font-bold m-auto p-10">
                Create crosswords using an interactive grid:
              </h3>
              <div aria-label="crossword graphic" className="pb-10">
                <CrosswordGrid
                  gridSize={5}
                  gridDimensions={"25vw"}
                  positionBlackSquares={true}
                  addInputs={false}
                />
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
            <div className="flex-col w-1/1">
              <h3 className="text-5xl font-bold m-atuo pb-15">
                Edit hints with ease:
              </h3>
              <div className="border-2 rounded-sm p-2 mb-2 bg-white min-w-50 w-1/4 m-auto">
                <h4 className="font-bold text-xl">Across:</h4>
                <ol className="mt-3 list-decimal list-inside">
                  {createHint("across1", "across1", "The man with a cane")}
                  {createHint("across2", "across2", "Banana split?")}
                  {createHint("across3", "across3", "Capital of Lesotho")}
                  {createHint("across4", "across4", "A funny gag")}
                </ol>
              </div>
              <div className="border-2 rounded-sm p-2 mb-2 bg-white min-w-50 w-1/4 m-auto">
                <h4 className="font-bold text-xl">Down:</h4>
                <ol className="mt-3 list-decimal list-inside">
                  {createHint("down1", "down1", "Hello World")}
                  {createHint("down2", "down2", "A common occurrence")}
                  {createHint("down3", "down3", "Pi day?")}
                  {createHint("down4", "down4", "Veracity")}
                </ol>
              </div>
            </div>
          </section>
          <hr className="border-3 " />
          <section className="flex flex-row justify-between items-center text-center bg-gray-200 pt-10 pb-10 lg:pt-0 lg:pb-0">
            <div className="w-full lg:w-1/2">
              <p className="text-4xl lg:text-4xl font-bold m-auto pb-15 pt-10 justify-self-center-safe ">
                Share custom puzzles with your friends,
                <br />
                solve current crosswords,
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
