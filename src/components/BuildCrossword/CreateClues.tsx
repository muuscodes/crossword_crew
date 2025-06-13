import { useState, useEffect } from "react";
import React from "react";
import ClueInit from "./ClueInit";

export default function CreateClues(props: any) {
  const { gridSize, currentGridNumbers, blackSquares } = props;
  const [acrossCluesInit, downCluesInit, clueDirectionsInit] = ClueInit(props);
  const [acrossClues, setAcrossClues] =
    useState<React.ReactElement[]>(acrossCluesInit);
  const [downClues, setDownClues] =
    useState<React.ReactElement[]>(downCluesInit);
  const [clueNumDirection, setClueNumDirection] =
    useState<string[][]>(clueDirectionsInit);

  const createClue = (id: string) => (
    <li className="flex">
      <p className="font-bold mr-2">{id}</p>
      <textarea
        id={id}
        cols={40}
        rows={2}
        defaultValue={"Enter a clue!"}
        style={{ resize: "none" }}
        wrap="true"
        className="border-1"
      ></textarea>
    </li>
  );

  const createClueNumDirections = () => {
    const newNumbers = [...currentGridNumbers];
    const newClueDirs = [...clueNumDirection];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;

        if (newNumbers[index]) {
          // Across clues
          if (blackSquares[index - 1] || j === 0) {
            newClueDirs[i][j] = "across";
          } else if (blackSquares[index - gridSize] || i === 0) {
            newClueDirs[i][j] = "down";
          }
        }
      }
    }
    setClueNumDirection(newClueDirs);
  };

  useEffect(() => {
    createClueNumDirections();
    const newAcrossClues: React.ReactElement[] = [];
    const newDownClues: React.ReactElement[] = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (clueNumDirection[i][j] && clueNumDirection[i][j] === "across") {
          const newAcrossClue = createClue(currentGridNumbers[i]);
          newAcrossClues.push(newAcrossClue);
        }
        if (clueNumDirection[i][j] && clueNumDirection[i][j] === "down") {
          const newDownClue = createClue(currentGridNumbers[i]);
          newDownClues.push(newDownClue);
        }
      }
    }

    setAcrossClues(newAcrossClues);
    setDownClues(newDownClues);
  }, [blackSquares]);

  return (
    <div className="flex-1 flex-col h-full ">
      <div className="flex-1 border-2 rounded-sm p-2 bg-white overflow-y-auto h-1/2">
        <div className="flex justify-between">
          <h4 className="font-bold text-xl text-center border-2 w-full">
            Across
          </h4>
        </div>
        <ul className="mt-3 list-none">
          {acrossClues.map((clue, index) => (
            <React.Fragment key={index}>{clue}</React.Fragment>
          ))}
        </ul>
      </div>
      <div className="flex-1 border-2 rounded-sm p-2 bg-white overflow-y-auto h-1/2">
        <div className="flex justify-between">
          <h4 className="font-bold text-xl text-center border-2 w-full">
            Down
          </h4>
        </div>
        <ul className="mt-3 list-none">
          {downClues.map((clue, index) => (
            <React.Fragment key={index}>{clue}</React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
