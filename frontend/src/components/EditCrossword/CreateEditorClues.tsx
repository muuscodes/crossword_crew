import { useState, useEffect, useRef } from "react";
import React from "react";
import type { EditorClueProps } from "../utils/types";

export default function CreateEditorClues(props: EditorClueProps) {
  const {
    gridSize,
    currentGridNumbers,
    blackSquares,
    gridDimensions,
    isFocusedClue,
    isFocusedCell,
    clueNumDirection,
    isClear,
    acrossClueValues,
    downClueValues,
    setClueNumDirection,
    handleFocusClue,
    handleInputChangeClue,
    setIsClear,
    mapClues,
  } = props;

  const hasInitialized = useRef(false);
  const [acrossClueInit, setAcrossClueInit] = useState<React.ReactElement[]>(
    []
  );
  const [downClueInit, setDownClueInit] = useState<React.ReactElement[]>([]);

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
          maxLength={50}
          defaultValue={value}
          style={{ resize: "none", fontSize: "1.25rem" }}
          wrap="soft"
          className={`border-1 w-7/8 ${isHighlight ? "bg-blue-200" : ""}`}
          onFocus={() => handleFocusClue(index, direction)}
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

  const initialize = (): void => {
    let acrossInit: React.ReactElement[] = [];
    let downInit: React.ReactElement[] = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;
        if (
          currentGridNumbers[index] &&
          clueNumDirection[index][0] === "across" &&
          clueNumDirection[index][1] === "down"
        ) {
          const newAcrossClue = createClue(
            currentGridNumbers[index]?.toString(),
            acrossClueValues[index],
            index,
            "across"
          );
          if (newAcrossClue) {
            acrossInit.push(newAcrossClue);
          }
          const newDownClue = createClue(
            currentGridNumbers[index]?.toString(),
            downClueValues[index],
            index,
            "down"
          );
          if (newDownClue) {
            downInit.push(newDownClue);
          }
        } else if (
          currentGridNumbers[index] &&
          clueNumDirection[index][0] === "across"
        ) {
          const newAcrossClue = createClue(
            currentGridNumbers[index]?.toString(),
            acrossClueValues[index],
            index,
            "across"
          );
          if (newAcrossClue) {
            acrossInit.push(newAcrossClue);
          }
        } else if (
          currentGridNumbers[index] &&
          clueNumDirection[index][1] === "down"
        ) {
          const newDownClue = createClue(
            currentGridNumbers[index]?.toString(),
            downClueValues[index],
            index,
            "down"
          );
          if (newDownClue) {
            downInit.push(newDownClue);
          }
        }
      }
    }
    setAcrossClueInit(acrossInit);
    setDownClueInit(downInit);
    if (isClear) {
      setIsClear(false);
    }
  };

  useEffect(() => {
    if (
      hasInitialized.current &&
      acrossClueInit.length > 0 &&
      downClueInit.length > 0
    ) {
      const newAcrossClues: React.ReactElement[] = [];
      const newDownClues: React.ReactElement[] = [];
      const newDirs: string[][] = createClueNumDirections();

      for (let index = 0; index < gridSize * gridSize; index++) {
        if (
          clueNumDirection[index][0] &&
          clueNumDirection[index][0] === "across"
        ) {
          const newAcrossClue = createClue(
            currentGridNumbers[index]?.toString(),
            acrossClueValues ? acrossClueValues[index] : "",
            index,
            "across"
          );
          if (newAcrossClue) {
            newAcrossClues.push(newAcrossClue);
          }
        }
        if (
          clueNumDirection[index][1] &&
          clueNumDirection[index][1] === "down"
        ) {
          const newDownClue = createClue(
            currentGridNumbers[index]?.toString(),
            downClueValues ? downClueValues[index] : "",
            index,
            "down"
          );
          if (newDownClue) {
            newDownClues.push(newDownClue);
          }
        }
      }

      setAcrossClueInit(newAcrossClues);
      setDownClueInit(newDownClues);
      setClueNumDirection(newDirs);
    }
  }, [blackSquares, isFocusedClue, isFocusedCell]);

  useEffect(() => {
    if (isClear) {
      initialize();
    }
  }, [isClear]);

  useEffect(() => {
    if (
      !hasInitialized.current &&
      currentGridNumbers.some((num) => num !== null) &&
      clueNumDirection.some((elem) => elem[0])
    ) {
      hasInitialized.current = true;
      initialize();
    }
  }, []);

  console.log(acrossClueInit);

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
          <ul className="mt-3 list-none">{mapClues(acrossClueInit)}</ul>
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
          <ul className="mt-3 list-none">{mapClues(downClueInit)}</ul>
        </div>
      </div>
    </div>
  );
}
