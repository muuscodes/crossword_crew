import { useState, useEffect } from "react";
import React from "react";
import CreateSolverGrid from "./CreateSolverGrid.tsx";
import CreateSolverClues from "./CreateSolverClues.tsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLessThan } from "@fortawesome/free-solid-svg-icons";
import { faGreaterThan } from "@fortawesome/free-solid-svg-icons";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import type { CreateSolverCrosswordProps } from "../utils/types.tsx";

export default function CreateSolverCrossword(
  props: CreateSolverCrosswordProps
) {
  const { setIsSolved, setIsSaved } = props;
  const [gridSize, setGridSize] = useState<number>(5);
  const [gridDimensions, setGridDimensions] = useState<string>("30vw");
  const [gridHeight, setGridHeight] = useState<string>(gridDimensions + "5px");
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
  const [clueIndicatorRight, setClueIndicatorRight] = useState<number>(0);
  const [clueIndicatorDown, setClueIndicatorDown] = useState<number>(-1);
  const [isAutocheck, setIsAutocheck] = useState<boolean>(false);
  const [autocheckGrid, setAutocheckGrid] = useState<boolean[]>(
    Array(gridSize * gridSize).fill(false)
  );
  const [autocheckKey, setAutocheckKey] = useState<string[]>(
    Array(gridSize * gridSize).fill("")
  );

  const {
    globalUser,
    isAuthenticated,
    setIsAuthenticated,
    setGlobalUser,
    fetchWithAuth,
  } = useAuth();
  const globalUserId = globalUser.user_id;
  const { gridId } = useParams();

  const getCrosswordData = async (userId: number) => {
    try {
      const response = await fetchWithAuth(
        `/users/${userId}/solver/${gridId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const result = await response.json();
      if (response.ok) {
        setGridSize(result[0].grid_size);
        setCurrentGridNumbers(result[0].grid_numbers);
        setCurrentGridValues(result[0].grid_values);
        setBlackSquares(result[0].black_squares);
        setClueNumDirection(result[0].clue_number_directions);
        setDownClueValues(result[0].down_clues);
        setPuzzleTitle(result[0].puzzle_title);
        setAcrossClueValues(result[0].across_clues);
        getAnswerKey(result[0].user_id);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getAnswerKey = async (userId: number) => {
    try {
      const response = await fetchWithAuth(`/users/${userId}/grids/${gridId}`, {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        setAutocheckKey(result.grid_values);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAutocheck = (): void => {
    const newAutocheckGrid = Array(gridSize * gridSize).fill(false);

    for (let index = 0; index < gridSize * gridSize; index++) {
      if (
        !blackSquares[index] &&
        currentGridValues[index] &&
        currentGridValues[index] !== autocheckKey[index]
      ) {
        newAutocheckGrid[index] = true;
      }
    }
    setAutocheckGrid(newAutocheckGrid);
    setIsAutocheck(!isAutocheck);
  };

  const handleClueIndicator = (): string => {
    let clue: string = "";

    if (isFocusedClue.indexOf(true) >= 0 || isFocusedCell.indexOf(true) > 0) {
      const index = isFocusedClue.indexOf(true);

      if (acrossClueValues[index] && downClueValues[index]) {
        if (isHighlightAcross) {
          clue =
            currentGridNumbers[index]?.toString() +
            "A | " +
            acrossClueValues[index];
        } else {
          clue =
            currentGridNumbers[index]?.toString() +
            "D | " +
            downClueValues[index];
        }
      } else if (acrossClueValues[index]) {
        clue =
          currentGridNumbers[index]?.toString() +
          "A | " +
          acrossClueValues[index];
      } else {
        clue =
          currentGridNumbers[index]?.toString() +
          "D | " +
          downClueValues[index];
      }
    }
    return clue;
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
    if (direction === "down") {
      isAcrossHighlight = false;
    }
    setIsAcrossClueHighlight(isAcrossHighlight);
  };

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

  async function saveProgress() {
    const arraysEqual: boolean = currentGridValues.every(
      (val, index) => val === autocheckKey[index]
    );
    const completed: boolean = arraysEqual;
    setIsSolved(arraysEqual);
    if (!arraysEqual) {
      setIsSaved(true);
    }

    try {
      const response = await fetchWithAuth(`/users/solver/${gridId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentGridValues,
          completed,
        }),
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message);
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  const checkSession = async () => {
    try {
      const response = await fetch("/auth/session", {
        method: "GET",
        credentials: "include",
      });
      const sessionData = await response.json();
      if (response.ok && sessionData.username && !isAuthenticated) {
        const newGlobalUser = {
          username: sessionData.username,
          user_id: sessionData.user_id,
        };
        getCrosswordData(newGlobalUser.user_id);
        setGlobalUser(newGlobalUser);
        setIsAuthenticated(true);
      } else if (isAuthenticated) {
        getCrosswordData(globalUserId);
      } else {
        setIsAuthenticated(false);
        throw new Error("Unauthorized access");
      }
    } catch (error: any) {
      console.error("Error checking session:", error);
      setIsAuthenticated(false);
      alert(error.message);
    }
  };

  useEffect(() => {
    if (
      currentGridNumbers.some((num) => num !== null) &&
      acrossClueValues.some((str) => str !== "")
    ) {
      setIsGridReady(true);
    } else {
      setIsGridReady(false);
    }
  }, [currentGridNumbers]);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateGridDimensions);
    updateGridDimensions();

    return () => {
      window.removeEventListener("resize", updateGridDimensions);
    };
  }, []);

  return (
    <section>
      <h1 className="text-center text-5xl my-5">{`Title: ${puzzleTitle}`}</h1>
      <div className="flex flex-col items-center m-auto border-4 w-fit shadow-2xl h-fit">
        <div className="flex flex-col md:flex-row justify-around items-center w-full bg-gray-200 border-b-4">
          <div className="flex flex-row justify-between p-2 bg-white w-4/5 my-3 border-2 text-2xl items-center">
            <FontAwesomeIcon
              icon={faLessThan}
              className="hover:scale-120 hover:opacity-50"
              onClick={() => setClueIndicatorRight(-1)}
            />
            <p className="w-3/5" onClick={() => setClueIndicatorDown(1)}>
              {handleClueIndicator()}
            </p>
            <FontAwesomeIcon
              icon={faGreaterThan}
              className="hover:scale-120 hover:opacity-50"
              onClick={() => setClueIndicatorRight(1)}
            />
          </div>
        </div>
        <div
          className={`flex flex-col md:flex-row border-y-2 w-fit h-auto`}
          style={{ height: `${gridHeight}` }}
        >
          <CreateSolverGrid
            gridSize={gridSize}
            gridDimensions={gridDimensions}
            addInputs={true}
            currentGridNumbers={currentGridNumbers}
            blackSquares={blackSquares}
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
            clueIndicatorRight={clueIndicatorRight}
            setClueIndicatorRight={setClueIndicatorRight}
            clueIndicatorDown={clueIndicatorDown}
            setClueIndicatorDown={setClueIndicatorDown}
            isAutocheck={isAutocheck}
            autocheckGrid={autocheckGrid}
            setAutocheckGrid={setAutocheckGrid}
            autocheckKey={autocheckKey}
          />

          {isGridReady && (
            <CreateSolverClues
              gridSize={gridSize}
              currentGridNumbers={currentGridNumbers}
              gridDimensions={gridDimensions}
              isFocusedCell={isFocusedCell}
              isFocusedClue={isFocusedClue}
              acrossClueValues={acrossClueValues}
              downClueValues={downClueValues}
              clueNumDirection={clueNumDirection}
              handleFocusClue={handleFocusClue}
              mapClues={mapClues}
            />
          )}
        </div>
        <div className="flex flex-row justify-evenly w-full py-2 bg-gray-200 border-t-3">
          <button className="fancyButton bigger" onClick={() => saveProgress()}>
            Save Progress
          </button>
          <label className="text-xl items-center hidden">
            Autocheck
            <input
              type="checkbox"
              id="checkbox"
              className="m-2 custom-checkbox"
              onClick={handleAutocheck}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
