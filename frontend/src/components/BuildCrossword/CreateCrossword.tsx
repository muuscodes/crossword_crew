import { useState, useEffect } from "react";
import React from "react";
import CrosswordGrid from "./CrosswordGrid";
import CreateClues from "./CreateClues";
import ClueInit from "./ClueInit";
import { useAuth } from "../../context/AuthContext";
import type { CreateCrosswordProps } from "../utils/types";

export default function CreateCrossword(props: CreateCrosswordProps) {
  const { setIsSaved, setUserMessage } = props;
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
  const [puzzleTitle, setPuzzleTitle] = useState<string>("");

  const { globalUser, fetchWithAuth } = useAuth();

  const handleGridSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value: number = parseInt(event.target.value);
    setGridDimensions(value <= 7 ? "30vw" : value <= 11 ? "35vw" : "40vw");
    setGridSize(value);
    setCurrentGridNumbers(Array(value * value).fill(null));
    setBlackSquares(Array(value * value).fill(false));
    setIsGridReady(false);
    updateGridDimensions();
  };

  const handleBlackSquaresChange = (): void => {
    setPositionBlackSquares(!positionBlackSquares);
  };

  const handleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value: string = event.target.value;
    setPuzzleTitle(value);
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

  const createClue = (
    id: string,
    value: string,
    index: number,
    direction: string
  ): React.ReactElement<unknown, string | React.JSXElementConstructor<any>> => {
    let isHighlight: boolean = false;
    const focusedCellIndex: number = isFocusedCell.indexOf(true);
    const indexOf100: number = currentGridNumbers.indexOf(100);
    const isThreeNumbered: boolean = indexOf100 > 0;

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
        <p
          className={`font-bold w-4 text-right ${
            isThreeNumbered ? "mr-5" : "mr-2"
          }`}
        >
          {id}
        </p>
        <textarea
          id={id + direction}
          cols={30}
          rows={1}
          tabIndex={0}
          maxLength={50}
          defaultValue={value}
          style={{ resize: "none", fontSize: "1.25rem" }}
          wrap="soft"
          className={`border-1 ${isHighlight ? "bg-blue-200" : ""}`}
          onFocus={() => handleFocusClue(index, direction)}
          onChange={(e) => handleInputChangeClue(e, direction, index)}
        ></textarea>
      </li>
    );
  };

  const assignNumbers = (blackSquares: boolean[]): number[] => {
    const newNumbers: number[] = Array(gridSize * gridSize).fill(null);
    let number: number = 1;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index: number = i * gridSize + j;

        if (blackSquares[index]) {
          continue;
        }

        if (j === 0 || (i < gridSize && blackSquares[index - gridSize])) {
          newNumbers[index] = number++;
        }

        if (
          i === 0 ||
          (j < gridSize &&
            !blackSquares[index - gridSize] &&
            blackSquares[index - 1])
        ) {
          if (newNumbers[index] === null) {
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
  ): React.JSX.Element[] => {
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
    const newNumbers = assignNumbers(cleanArrayBool);
    const [acrossCluesInit, downCluesInit, clueDirectionsInit] = ClueInit({
      gridSize,
      currentGridNumbers,
      isFocusedClue,
      isFocusedCell,
      clueNumDirection,
      handleFocusClue,
      handleInputChangeClue,
    });
    setBlackSquares(cleanArrayBool);
    setIsFocusedCell(cleanArrayBool);
    setIsFocusedClue(cleanArrayBool);
    setIsSecondaryFocusedCell(cleanArrayBool);
    setAcrossClueValues(cleanArrayString);
    setDownClueValues(cleanArrayString);
    setIsHighlightAcross(true);
    setCurrentGridValues(cleanArrayString);
    setCurrentGridNumbers(newNumbers);
    setAcrossClues(mapClues(acrossCluesInit));
    setDownClues(mapClues(downCluesInit));
    setClueNumDirection(clueDirectionsInit);
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

    const newAcrossValues: string[] = [...acrossClueValues].map((val) => {
      return val;
    });
    const newDownValues: string[] = [...downClueValues].map((val) => {
      return val;
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

  const handleGridViability = () => {
    const messages: string[] = [];
    const hasNonNullGridValues: boolean = currentGridValues.some(
      (value: string) => value !== ""
    );
    const hasAcrossClueValues: boolean = acrossClueValues.some(
      (value: string) => value !== ""
    );
    const hasDownClueValues: boolean = downClueValues.some(
      (value: string) => value !== ""
    );

    if (!puzzleTitle) {
      messages.push("a title");
    }
    if (!hasNonNullGridValues) {
      messages.push("entries to the grid");
    }
    if (!hasDownClueValues) {
      messages.push("down clues");
    }
    if (!hasAcrossClueValues) {
      messages.push("across clues");
    }

    if (messages.length > 0) {
      if (messages.length === 1) {
        return "Please add " + messages[0];
      } else {
        const lastMessage = messages.pop();
        return "Please add " + messages.join(", ") + ", and " + lastMessage;
      }
    } else {
      return "";
    }
  };

  async function saveGrid() {
    const message = handleGridViability();
    if (!message) {
      setIsSaved(true);
      const userId = globalUser.user_id;
      try {
        const response = await fetchWithAuth(`/users/${userId}/grids/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            credentials: "include",
          },
          body: JSON.stringify({
            puzzleTitle,
            gridSize,
            currentGridValues,
            currentGridNumbers,
            blackSquares,
            acrossClueValues,
            downClueValues,
            clueNumDirection,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message);
        }
      } catch (error: any) {
        alert(error.message);
      }
    }
    setUserMessage(message);
    setTimeout(() => {
      setUserMessage("");
    }, 10000);
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
    if (currentGridNumbers.some((num) => num !== null)) {
      setIsGridReady(true);
    } else {
      setIsGridReady(false);
    }
  }, [currentGridNumbers]);

  useEffect(() => {
    window.addEventListener("resize", updateGridDimensions);
    updateGridDimensions();

    return () => {
      window.removeEventListener("resize", updateGridDimensions);
    };
  }, []);

  return (
    <div className="flex flex-col items-center m-auto border-4 w-fit shadow-2xl h-fit">
      <div className="flex flex-col lg:flex-row justify-around items-center w-full bg-gray-200 pt-2 lg:pt-0">
        <div>
          <label className="text-xl mr-1" htmlFor="gridSize">
            Grid Size:
          </label>
          <select
            name="gridSize"
            id="gridSize"
            value={gridSize}
            onChange={handleGridSizeChange}
            className="border-2 text-xl bg-white"
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
        <label className="text-xl flex items-center">
          Puzzle Title:
          <input
            type="text"
            id="title"
            maxLength={50}
            className="m-2 bg-white border-2 pl-0.5"
            onChange={(e) => handleTitleChange(e)}
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
          blackSquares={blackSquares}
          isFocusedCell={isFocusedCell}
          isSecondaryFocusedCell={isSecondaryFocusedCell}
          isHighlightAcross={isHighlightAcross}
          clueNumDirection={clueNumDirection}
          clueToCellHighlight={clueToCellHighlight}
          isAcrossClueHighlight={isAcrossClueHighlight}
          isFocusedOnGrid={isFocusedOnGrid}
          currentGridValues={currentGridValues}
          setCurrentGridNumbers={setCurrentGridNumbers}
          setBlackSquares={setBlackSquares}
          setIsFocusedCell={setIsFocusedCell}
          setIsFocusedClue={setIsFocusedClue}
          setIsSecondaryFocusedCell={setIsSecondaryFocusedCell}
          setIsHighlightAcross={setIsHighlightAcross}
          setIsFocusedOnGrid={setIsFocusedOnGrid}
          setCurrentGridValues={setCurrentGridValues}
          handleClear={handleClear}
          scrollToClue={scrollToClue}
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
            createClue={createClue}
            acrossClues={acrossClues}
            setAcrossClues={setAcrossClues}
            downClues={downClues}
            setDownClues={setDownClues}
            clueNumDirection={clueNumDirection}
            setClueNumDirection={setClueNumDirection}
            handleFocusClue={handleFocusClue}
            handleInputChangeClue={handleInputChangeClue}
            mapClues={mapClues}
          />
        )}
      </div>
      <div className="flex flex-row justify-evenly w-full py-2 bg-gray-200 border-t-3">
        <button className="fancyButton bigger" onClick={() => saveGrid()}>
          Save
        </button>
        <button className="fancyButton bigger" onClick={() => handleClear()}>
          Clear
        </button>
      </div>
    </div>
  );
}
