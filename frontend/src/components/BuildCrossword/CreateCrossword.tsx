import { useState, useEffect } from "react";
import React from "react";
import CrosswordGrid from "./CrosswordGrid";
import CreateClues from "./CreateClues";
import ClueInit from "./ClueInit";

export default function CreateCrossword(props: any) {
  const { setIsSaved } = props;
  const [gridSize, setGridSize] = useState<number>(5);
  const [gridDimensions, setGridDimensions] = useState<string>("30vw");
  const [gridHeight, setGridHeight] = useState<string>(gridDimensions + "5px");
  const [positionBlackSquares, setPositionBlackSquares] =
    useState<boolean>(false);
  const [currentGridNumbers, setCurrentGridNumbers] = useState<number[]>(
    Array(gridSize * gridSize).fill(null)
  );
  const [blackSquares, setBlackSquares] = useState<boolean[]>(
    Array(gridSize * gridSize).fill(false)
  );
  const [isFocusedCell, setIsFocusedCell] = useState<boolean[]>(
    Array(gridSize * gridSize).fill(false)
  );
  const [isSecondaryFocusedCell, setIsSecondaryFocusedCell] = useState<
    boolean[]
  >(Array(gridSize * gridSize).fill(false));
  const [isFocusedClue, setIsFocusedClue] = useState<boolean[]>(
    Array(gridSize * gridSize).fill(false)
  );
  const [isHighlightAcross, setIsHighlightAcross] = useState<boolean>(true);
  const [acrossClues, setAcrossClues] = useState<React.ReactElement[]>([]);
  const [downClues, setDownClues] = useState<React.ReactElement[]>([]);
  const [clueNumDirection, setClueNumDirection] = useState<string[][]>([]);
  const [clueToCellHighlight, setClueToCellHighlight] = useState<number>(-1);
  const [isAcrossClueHighlight, setIsAcrossClueHighlight] =
    useState<boolean>(true);
  const [acrossClueValues, setAcrossClueValues] = useState<string[]>(
    Array(gridSize * gridSize).fill("")
  );
  const [downClueValues, setDownClueValues] = useState<string[]>(
    Array(gridSize * gridSize).fill("")
  );
  const [currentGridValues, setCurrentGridValues] = useState<string[]>(
    Array(gridSize * gridSize).fill("")
  );
  const [isGridReady, setIsGridReady] = useState<boolean>(false);
  const [isFocusedOnGrid, setIsFocusedOnGrid] = useState<boolean>(false);

  const handleGridSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value: number = parseInt(event.target.value);
    setGridDimensions(value <= 7 ? "30vw" : value <= 11 ? "35vw" : "40vw");
    setGridSize(value);
    setCurrentGridNumbers(Array(value * value).fill(null));
    setBlackSquares(Array(value * value).fill(false));
    setIsGridReady(false);
  };

  const handleBlackSquaresChange = (): void => {
    setPositionBlackSquares(!positionBlackSquares);
  };

  const scrollToClue = (index: number, direction: string): void => {
    const containerId: string =
      direction === "across"
        ? "scrollableContainerAcross"
        : "scrollableContainerDown";
    const container: HTMLElement | null = document.getElementById(containerId);
    const clueElement: Element | undefined =
      container?.querySelector("ul")?.children[index];
    if (clueElement) {
      clueElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const assignNumbers = (blackSquares: boolean[]): number[] => {
    const newNumbers: number[] = Array(gridSize * gridSize).fill(null);
    let number: number = 1;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index: number = i * gridSize + j;

        // Check if the cell is a black square
        if (blackSquares[index]) {
          continue; // Skip black squares
        }

        // Check for horizontal word start
        if (j === 0 || (i < gridSize && blackSquares[index - gridSize])) {
          newNumbers[index] = number++;
        }

        // Check for vertical word start
        if (
          i === 0 ||
          (j < gridSize &&
            !blackSquares[index - gridSize] &&
            blackSquares[index - 1])
        ) {
          if (newNumbers[index] === null) {
            // Only assign if not already assigned
            newNumbers[index] = number++;
          }
        }
      }
    }
    return newNumbers;
  };

  const mapClues = (
    array: React.ReactElement<
      unknown,
      string | React.JSXElementConstructor<any>
    >[]
  ) => {
    return array.map(
      (
        value: React.ReactElement<
          unknown,
          string | React.JSXElementConstructor<any>
        >,
        index: number
      ) => <React.Fragment key={index}>{value}</React.Fragment>
    );
  };

  const handleClear = (): void => {
    const cleanArrayBool: boolean[] = Array(gridSize * gridSize).fill(false);
    const cleanArrayString: string[] = Array(gridSize * gridSize).fill("");
    setBlackSquares(cleanArrayBool);
    setIsFocusedCell(cleanArrayBool);
    setIsFocusedClue(cleanArrayBool);
    setIsSecondaryFocusedCell(cleanArrayBool);
    setAcrossClueValues(cleanArrayString);
    setDownClueValues(cleanArrayString);
    setIsHighlightAcross(true);
    setCurrentGridValues(cleanArrayString);
    const newNumbers = assignNumbers(cleanArrayBool);
    setCurrentGridNumbers(newNumbers);
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
    mapClues(acrossCluesInit);
    mapClues(downCluesInit);
  };

  const handleFocusClue = (index: number, direction: string): void => {
    setIsFocusedOnGrid(false);
    const newFocusedCells: boolean[] = Array(gridSize * gridSize).fill(false);
    const newFocusedClues: boolean[] = Array(gridSize * gridSize).fill(false);
    newFocusedCells[index] = true;
    newFocusedClues[index] = true;
    setIsFocusedCell(newFocusedCells);
    setIsFocusedClue(newFocusedClues);
    setClueToCellHighlight(index);
    let isAcrossHighlight: boolean = true;
    if (direction === "across") {
      isAcrossHighlight = true;
    } else isAcrossHighlight = false;
    setIsAcrossClueHighlight(isAcrossHighlight);
  };

  const handleUserInputClue = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    direction: string,
    index: number
  ): void => {
    const value: string = event.target.value;
    const newAcrossValues: string[] = [...acrossClueValues].map((value) => {
      return value;
    });
    const newDownValues = [...downClueValues].map((value) => {
      return value;
    });

    if (!isFocusedOnGrid) {
      if (direction === "across") {
        newAcrossValues[index] = value;
        setAcrossClueValues(newAcrossValues);
      }
      if (direction === "down") {
        newDownValues[index] = value;
        setDownClueValues(newDownValues);
      }
    }
  };

  const handleInputChangeClue = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    direction: string,
    index: number
  ): void => {
    const target: EventTarget & HTMLTextAreaElement = event.target;
    target.style.height = "auto";
    const newHeight: number = Math.min(target.scrollHeight, 48);
    target.style.height = `${newHeight}px`;
    handleUserInputClue(event, direction, index);
  };

  useEffect(() => {
    if (currentGridNumbers.some((num) => num !== null)) {
      setIsGridReady(true);
    } else {
      setIsGridReady(false);
    }
  }, [currentGridNumbers]);

  async function saveGrid() {
    setIsSaved(true);
    const userid = 1;
    const completed = false;
    try {
      await fetch("/users/grids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid,
          completed,
          gridSize,
          currentGridValues,
          currentGridNumbers,
          blackSquares,
          acrossClueValues,
          downClueValues,
          clueNumDirection,
        }),
      });
      // setIsSaved(false);
    } catch (error) {
      console.log("Server error:", error);
    }
  }
  const updateGridDimensions = () => {
    const newWidth: string =
      window.innerWidth < 420
        ? " 320px"
        : window.innerWidth < 768
        ? "387.5px"
        : gridDimensions;
    const newHeight: string =
      window.innerWidth < 768 ? "h-fit" : `${gridDimensions} + 5px`;
    setGridDimensions(newWidth);
    setGridHeight(newHeight);
  };

  useEffect(() => {
    window.addEventListener("resize", updateGridDimensions);
    updateGridDimensions();

    return () => {
      window.removeEventListener("resize", updateGridDimensions);
    };
  }, []);

  return (
    <div className="flex flex-col items-center m-auto border-4 w-fit shadow-2xl h-fit">
      <div className="flex flex-col md:flex-row justify-around items-center w-full bg-gray-200">
        <div>
          <label className="text-xl mr-1" htmlFor="gridSize">
            Grid Size:
          </label>
          <select
            name="gridSize"
            id="gridSize"
            value={gridSize}
            onChange={handleGridSizeChange}
            className="border-1 text-xl bg-white"
          >
            <option value="5">5</option>
            <option value="7">7</option>
            <option value="9">9</option>
            <option value="11">11</option>
            <option value="13">13</option>
            <option value="15">15</option>
          </select>
        </div>
        <label className="text-xl flex items-center">
          Set Black Squares
          <input
            type="checkbox"
            id="checkbox"
            className="m-2 custom-checkbox"
            onClick={handleBlackSquaresChange}
          />
        </label>
      </div>
      <div
        className={`flex flex-col md:flex-row border-y-2 w-fit h-auto`}
        style={{ height: `${gridHeight}` }}
      >
        <CrosswordGrid
          gridSize={gridSize}
          gridDimensions={gridDimensions}
          positionBlackSquares={positionBlackSquares}
          addInputs={true}
          currentGridNumbers={currentGridNumbers}
          setCurrentGridNumbers={setCurrentGridNumbers}
          blackSquares={blackSquares}
          setBlackSquares={setBlackSquares}
          isFocusedCell={isFocusedCell}
          setIsFocusedCell={setIsFocusedCell}
          setIsFocusedClue={setIsFocusedClue}
          isSecondaryFocusedCell={isSecondaryFocusedCell}
          setIsSecondaryFocusedCell={setIsSecondaryFocusedCell}
          isHighlightAcross={isHighlightAcross}
          setIsHighlightAcross={setIsHighlightAcross}
          clueNumDirection={clueNumDirection}
          scrollToClue={scrollToClue}
          clueToCellHighlight={clueToCellHighlight}
          isAcrossClueHighlight={isAcrossClueHighlight}
          isFocusedOnGrid={isFocusedOnGrid}
          setIsFocusedOnGrid={setIsFocusedOnGrid}
          currentGridValues={currentGridValues}
          setCurrentGridValues={setCurrentGridValues}
          handleClear={handleClear}
          assignNumbers={assignNumbers}
        />

        {isGridReady && (
          <CreateClues
            gridSize={gridSize}
            currentGridNumbers={currentGridNumbers}
            blackSquares={blackSquares}
            gridDimensions={gridDimensions}
            isFocusedCell={isFocusedCell}
            isFocusedClue={isFocusedClue}
            acrossClues={acrossClues}
            setAcrossClues={setAcrossClues}
            downClues={downClues}
            setDownClues={setDownClues}
            clueNumDirection={clueNumDirection}
            setClueNumDirection={setClueNumDirection}
            handleFocusClue={handleFocusClue}
            handleUserInputClue={handleUserInputClue}
            handleInputChangeClue={handleInputChangeClue}
            mapClues={mapClues}
          />
        )}
      </div>
      <div className="flex flex-row justify-evenly w-full py-2 bg-gray-200 border-t-3">
        <button className="fancyButton bigger" onClick={() => saveGrid()}>
          Save
        </button>
        <button className="fancyButton bigger " onClick={() => handleClear()}>
          Clear
        </button>
        <button className="fancyButton bigger">Share</button>
      </div>
    </div>
  );
}
