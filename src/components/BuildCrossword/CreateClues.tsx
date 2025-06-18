import { useState, useEffect, useRef } from "react";
import React from "react";
import ClueInit from "./ClueInit";

export default function CreateClues(props: any) {
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
    setIsFocusedClue,
    isFocusedCell,
    setIsFocusedCell,
    clueNumDirection,
    setClueNumDirection,
    setClueToCellHighlight,
  } = props;

  const [acrossClueValues, setAcrossClueValues] = useState<string[]>(
    Array(gridSize * gridSize).fill("")
  );
  const [downClueValues, setDownClueValues] = useState<string[]>(
    Array(gridSize * gridSize).fill("")
  );
  const hasInitialized = useRef(false);

  const createClue = (
    id: string,
    value: string,
    index: number,
    direction: string
  ) => {
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
          defaultValue={value}
          style={{ resize: "none", fontSize: "1.25rem" }}
          wrap="true"
          className={`border-1 ${isHighlight ? "bg-blue-200" : ""}`}
          onFocus={() => handleFocus(index)}
          onChange={(e) => handleUserInput(e, parseInt(id))}
        ></textarea>
      </li>
    );
  };

  const createClueNumDirections = () => {
    const newClueDirs: string[][] = Array.from(
      { length: gridSize * gridSize },
      () => ["", ""]
    );
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;

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

  const handleFocus = (index: number) => {
    const newFocusedCells = Array(gridSize * gridSize).fill(false);
    const newFocusedClues = Array(gridSize * gridSize).fill(false);
    newFocusedCells[index] = true;
    newFocusedClues[index] = true;
    setIsFocusedCell(newFocusedCells);
    setIsFocusedClue(newFocusedClues);
    setClueToCellHighlight(index);
  };

  const handleUserInput = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const value = event.target.value;
    const newAcrossValues = [...acrossClueValues];
    const newDownValues = [...downClueValues];

    if (clueNumDirection[index][0] === "across") {
      newAcrossValues[index] = value;
      setAcrossClueValues(newAcrossValues);
    }
    if (clueNumDirection[index][1] === "down") {
      newDownValues[index] = value;
      setDownClueValues(newDownValues);
    }
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
      });
      setAcrossClues(acrossCluesInit);
      setDownClues(downCluesInit);
      setClueNumDirection(clueDirectionsInit);
    }
  }, [gridSize, currentGridNumbers]);

  useEffect(() => {
    if (hasInitialized.current && acrossClues.length > 0) {
      const newDirs = createClueNumDirections();
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
      className="flex-col border-2"
      style={{ height: `calc(${gridDimensions} + 5px)` }}
    >
      <div
        id="scrollableContainerAcross"
        className="border-2 p-2 bg-white overflow-y-auto h-1/2"
      >
        <h4 className="font-bold text-xl px-2 text-white bg-black border-2 w-fit">
          Across
        </h4>
        <ul className="mt-3 list-none">
          {acrossClues.map((clue: React.ReactElement, index: string) => (
            <React.Fragment key={index}>{clue}</React.Fragment>
          ))}
        </ul>
      </div>
      <div
        id="scrollableContainerDown"
        className="border-2 p-2 bg-white overflow-y-auto h-1/2"
      >
        <h4 className="font-bold text-xl px-2 text-white bg-black border-2 w-fit">
          Down
        </h4>
        <ul className="mt-3 list-none">
          {downClues.map((clue: React.ReactElement, index: string) => (
            <React.Fragment key={index}>{clue}</React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
