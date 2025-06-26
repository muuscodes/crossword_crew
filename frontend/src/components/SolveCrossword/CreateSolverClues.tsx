import { useEffect, useState } from "react";
import React from "react";
import type { SolverClueProps } from "../utils/types";

export default function CreateClues(props: SolverClueProps) {
  const {
    gridSize,
    currentGridNumbers,
    gridDimensions,
    acrossClueValues,
    downClueValues,
    isFocusedClue,
    isFocusedCell,
    clueNumDirection,
    handleFocusClue,
    mapClues,
  } = props;
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
          defaultValue={value}
          contentEditable="false"
          style={{ resize: "none", fontSize: "1.25rem" }}
          wrap="soft"
          className={`border-1 ${isHighlight ? "bg-blue-200" : ""}`}
          onFocus={() => handleFocusClue(index, direction)}
        ></textarea>
      </li>
    );
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
  };

  useEffect(() => {
    if (
      currentGridNumbers.some((num) => num !== null) &&
      clueNumDirection.some((elem) => elem[0])
    ) {
      initialize();
    }
  }, []);

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
