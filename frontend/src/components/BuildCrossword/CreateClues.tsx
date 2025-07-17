import { useEffect, useRef } from "react";
import React from "react";
import ClueInit from "./ClueInit";
import type { CrosswordClueProps } from "../utils/types";

export default function CreateClues(props: CrosswordClueProps) {
  const {
    gridSize,
    currentGridNumbers,
    blackSquares,
    gridDimensions,
    isFocusedCell,
    clueNumDirection,
    acrossClues,
    downClues,
    isFocusedClue,
    createClue,
    setAcrossClues,
    setDownClues,
    setClueNumDirection,
    handleFocusClue,
    handleInputChangeClue,
    mapClues,
  } = props;

  const hasInitialized = useRef(false);

  const createClueNumDirections = (): string[][] => {
    const newClueDirs: string[][] = Array.from(
      { length: gridSize * gridSize },
      () => ["", ""]
    );
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index: number = i * gridSize + j;

        if (currentGridNumbers[index]) {
          if (
            (j === 0 && i === 0) ||
            (blackSquares[index - 1] && i === 0) ||
            (blackSquares[index - 1] && blackSquares[index - gridSize]) ||
            (j === 0 && blackSquares[index - gridSize])
          ) {
            newClueDirs[index][0] = "across";
            newClueDirs[index][1] = "down";
          } else if (blackSquares[index - 1] || j === 0) {
            newClueDirs[index][0] = "across";
          } else if (blackSquares[index - gridSize] || i === 0) {
            newClueDirs[index][1] = "down";
          }
        }
      }
    }
    return newClueDirs;
  };

  useEffect(() => {
    if (
      !hasInitialized.current &&
      gridSize &&
      currentGridNumbers &&
      blackSquares
    ) {
      hasInitialized.current = true;
      const [acrossCluesInit, downCluesInit, clueDirectionsInit] = ClueInit({
        gridSize,
        currentGridNumbers,
        isFocusedClue,
        isFocusedCell,
        clueNumDirection,
        handleFocusClue,
        handleInputChangeClue,
      });
      setAcrossClues(acrossCluesInit);
      setDownClues(downCluesInit);
      setClueNumDirection(clueDirectionsInit);
    }
  }, [gridSize, currentGridNumbers]);

  useEffect(() => {
    if (
      hasInitialized.current &&
      acrossClues.length > 0 &&
      downClues.length > 0
    ) {
      const newDirs: string[][] = createClueNumDirections();
      const newAcrossClues: React.ReactElement[] = [];
      const newDownClues: React.ReactElement[] = [];
      const nullGrid: boolean = !currentGridNumbers.some(
        (num: number) => num !== null
      );

      for (let index = 0; index < gridSize * gridSize; index++) {
        if (nullGrid) {
          break;
        }
        if (
          newDirs[index][0] &&
          newDirs[index][0] === "across" &&
          newDirs[index][1] &&
          newDirs[index][1] === "down"
        ) {
          const newAcrossClue = createClue(
            currentGridNumbers[index]?.toString(),
            "",
            index,
            "across"
          );
          if (newAcrossClue) {
            newAcrossClues.push(newAcrossClue);
          }
          const newDownClue = createClue(
            currentGridNumbers[index]?.toString(),
            "",
            index,
            "down"
          );
          if (newDownClue) {
            newDownClues.push(newDownClue);
          }
        } else if (
          newDirs[index][0] &&
          newDirs[index][0] === "across" &&
          newDirs[index][1] !== "down"
        ) {
          const newAcrossClue = createClue(
            currentGridNumbers[index]?.toString(),
            "",
            index,
            "across"
          );
          if (newAcrossClue) {
            newAcrossClues.push(newAcrossClue);
          }
        } else if (
          newDirs[index][1] &&
          newDirs[index][1] === "down" &&
          newDirs[index][0] !== "across"
        ) {
          const newDownClue = createClue(
            currentGridNumbers[index]?.toString(),
            "",
            index,
            "down"
          );
          if (newDownClue) {
            newDownClues.push(newDownClue);
          }
        }
      }
      setAcrossClues(newAcrossClues);
      setDownClues(newDownClues);
      setClueNumDirection(newDirs);
    }
  }, [blackSquares, isFocusedClue, isFocusedCell]);

  return (
    <div
      className="flex-col border-y-2"
      style={{ height: `calc(${gridDimensions} + 5px)` }}
    >
      <div className="h-1/2">
        <div className="border-2 bg-gray-200 h-2/8 flex items-center text-center">
          <h4 className="m-auto text-center font-bold text-xl px-1 text-white bg-black w-fit">
            Across
          </h4>
        </div>
        <div
          id="scrollableContainerAcross"
          className="border-2 p-2 bg-white overflow-y-auto h-6/8"
        >
          <ul className="mt-3 list-none">{mapClues(acrossClues)}</ul>
        </div>
      </div>
      <div className="h-1/2">
        <div className="border-2 bg-gray-200 h-2/8 flex items-center text-center">
          <h4 className="m-auto text-center font-bold text-xl px-1 text-white bg-black w-fit">
            Down
          </h4>
        </div>
        <div
          id="scrollableContainerDown"
          className="border-2 p-2 bg-white overflow-y-auto h-6/8"
        >
          <ul className="mt-3 list-none">{mapClues(downClues)}</ul>
        </div>
      </div>
    </div>
  );
}
