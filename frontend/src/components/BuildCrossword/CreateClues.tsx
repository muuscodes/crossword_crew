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
    acrossClues,
    setAcrossClues,
    downClues,
    setDownClues,
    isFocusedClue,
    isFocusedCell,
    clueNumDirection,
    setClueNumDirection,
    handleUserInputClue,
    handleFocusClue,
    handleInputChangeClue,
    mapClues,
  } = props;

  const hasInitialized = useRef(false);

  const createClue = (
    id: string,
    value: string,
    index: number,
    direction: string
  ): React.ReactElement<unknown, string | React.JSXElementConstructor<any>> => {
    let isHighlight: boolean = false;
    const focusedCellIndex: number = isFocusedCell.indexOf(true);

    if (
      isFocusedClue[index] &&
      clueNumDirection[index][0] &&
      clueNumDirection[index][1]
    ) {
      if (isFocusedCell[index] == isFocusedClue[index]) {
        isHighlight = true;
      } else if (focusedCellIndex < index + gridSize && direction === "down") {
        isHighlight = false;
      } else if (
        focusedCellIndex < index + gridSize &&
        direction === "across"
      ) {
        isHighlight = true;
      } else if (focusedCellIndex >= index + gridSize && direction === "down") {
        isHighlight = true;
      } else if (
        focusedCellIndex >= index + gridSize &&
        direction === "across"
      ) {
        isHighlight = false;
      }
    } else if (isFocusedClue[index]) {
      isHighlight = true;
    }

    return (
      <li className="flex">
        <p className="font-bold mr-2 w-4 text-right">{id}</p>
        <textarea
          id={id + direction}
          cols={30}
          rows={1}
          tabIndex={0}
          defaultValue={value}
          style={{ resize: "none", fontSize: "1.25rem" }}
          wrap="soft"
          className={`border-1 ${isHighlight ? "bg-blue-200" : ""}`}
          onFocus={() => handleFocusClue(index, direction)}
          // onChange={(e) => handleUserInput(e, id, index)}
          onChange={(e) => handleInputChangeClue(e, direction, index)}
        ></textarea>
      </li>
    );
  };

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
        handleUserInputClue,
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

      for (let index = 0; index < gridSize * gridSize; index++) {
        if (newDirs[index][0] === "across") {
          const newAcrossClue = createClue(
            currentGridNumbers[index]?.toString(),
            "",
            index,
            "across"
          );
          if (newAcrossClue) {
            newAcrossClues.push(newAcrossClue);
          }
        }
        if (newDirs[index][1] && newDirs[index][1] === "down") {
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
      <div className="h-1/2 -z-10">
        <div className="border-2 bg-gray-200">
          <h4 className="flex items-center font-bold text-xl px-2 text-white bg-black w-fit h-fit">
            Across
          </h4>
        </div>
        <div
          id="scrollableContainerAcross"
          className="border-2 p-2 bg-white overflow-y-auto h-6/7"
        >
          <ul className="mt-3 list-none">{mapClues(acrossClues)}</ul>
        </div>
      </div>
      <div className="h-1/2">
        <div className="border-2 bg-gray-200">
          <h4 className="flex items-center font-bold text-xl px-2 text-white bg-black w-fit h-fit">
            Down
          </h4>
        </div>
        <div
          id="scrollableContainerDown"
          className="border-2 p-2 bg-white overflow-y-auto h-6/7"
        >
          <ul className="mt-3 list-none">{mapClues(downClues)}</ul>
        </div>
      </div>
    </div>
  );
}
