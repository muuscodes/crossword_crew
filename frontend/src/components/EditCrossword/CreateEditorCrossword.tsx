import { useState, useEffect, useRef } from "react";
import React from "react";
import CrosswordEditorGrid from "./CrosswordEditorGrid";
import CreateEditorClues from "./CreateEditorClues";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CreateCrossword(props: any) {
  const { setIsSaved, setUserMessage } = props;
  const [gridSize, setGridSize] = useState<number>(5);
  const [gridDimensions, setGridDimensions] = useState<string>("30vw");
  const [gridHeight, setGridHeight] = useState<string>(gridDimensions + "5px");
  const [buttonsWidth, setButtonsWidth] = useState<string>(gridDimensions);
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
  const [isShare, setIsShare] = useState<boolean>(false);
  const [recipientUsername, setRecipientUsername] = useState<string>("");
  const hasInitialized = useRef(false);
  const isClear = useRef(false);

  const {
    globalUser,
    isAuthenticated,
    setIsAuthenticated,
    setGlobalUser,
    fetchWithAuth,
    setError,
  } = useAuth();
  const globalUserId = globalUser.user_id;
  const { gridId } = useParams();
  const navigate = useNavigate();

  const getCrosswordData = async (userId: number) => {
    try {
      const response = await fetchWithAuth(
        `/users/${userId}/editor/${gridId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const result = await response.json();
      if (response.ok) {
        setGridSize(result.grid_size);
        setCurrentGridNumbers(result.grid_numbers);
        setCurrentGridValues(result.grid_values);
        setBlackSquares(result.black_squares);
        setClueNumDirection(result.clue_number_directions);
        setDownClueValues(result.down_clues);
        setPuzzleTitle(result.puzzle_title);
        setAcrossClueValues(result.across_clues);
        hasInitialized.current = true;
      } else {
        setError(result.message || "An error occurred while fetching data.");
        // navigate("/errorpage");
        return;
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred");
      // navigate("/errorpage");
    }
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
    if (hasInitialized.current) {
      isClear.current = true;
    }
    const cleanArrayBool: boolean[] = Array(gridSize * gridSize).fill(false);
    const cleanArrayString: string[] = Array(gridSize * gridSize).fill("");
    setBlackSquares(cleanArrayBool);
    setIsFocusedCell(cleanArrayBool);
    setIsFocusedClue(cleanArrayBool);
    setIsSecondaryFocusedCell(cleanArrayBool);
    setIsHighlightAcross(true);
    setCurrentGridValues(cleanArrayString);
    const newNumbers = assignNumbers(cleanArrayBool);
    setCurrentGridNumbers(newNumbers);
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

  const handleInputSend = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value: string = event.target.value;
    setRecipientUsername(value);
  };

  const handleShareToggle = () => {
    setIsShare(!isShare);
    let message = "";
    setUserMessage(message);
  };

  const handleSendShare = async () => {
    setIsShare(false);
    let message = handleGridViability();
    if (!message) {
      try {
        const response = await fetchWithAuth(
          `/users/${globalUserId}/grids/${gridId}/share`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipientUsername,
            }),
            credentials: "include",
          }
        );
        const result = await response.json();
        if (response.ok) {
          message = "Puzzle sent!";
        } else {
          setError(result.message || "An error occurred while fetching data.");
          // navigate("/errorpage");
          return;
        }
      } catch (error: any) {
        setError(error.message || "An unexpected error occurred");
        // navigate("/errorpage");
      }
    }
    setUserMessage(message);
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
    let message = handleGridViability();
    if (!message) {
      setIsSaved(true);
      try {
        const response = await fetchWithAuth(`/users/editor/${gridId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
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
          credentials: "include",
        });
        if (!response.ok) {
          message = "Can not edit a shared crossword";
        }
      } catch (error: any) {
        setError(error.message || "An unexpected error occurred");
        // navigate("/errorpage");
      }
    }
    setUserMessage(message);
    setTimeout(() => {
      setUserMessage("");
    }, 3000);
  }

  const handleDelete = async () => {
    try {
      const response = await fetchWithAuth(
        `/users/${globalUserId}/delete/${gridId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const result = await response.json();
      if (response.ok) navigate("/library");
      else {
        setError(result.message || "An error occurred while fetching data.");
        // navigate("/errorpage");
        return;
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred");
      // navigate("/errorpage");
    }
  };

  const updateGridDimensions = () => {
    const newWidth: string =
      window.innerWidth < 420
        ? " 320px"
        : window.innerWidth < 768
        ? "387.5px"
        : gridDimensions;
    const newButtonWidth: string =
      window.innerWidth < 420
        ? " 325px"
        : window.innerWidth < 768
        ? "392.5px"
        : "100%";
    const newHeight: string =
      window.innerWidth < 768 ? "h-fit" : `${gridDimensions} + 5px`;
    setGridDimensions(newWidth);
    setGridHeight(newHeight);
    setButtonsWidth(newButtonWidth);
  };

  const checkSession = async () => {
    try {
      const response = await fetchWithAuth("/auth/session", {
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
        setError(sessionData.message || "Session check failed");
        // navigate("/errorpage");
        return;
      }
    } catch (error: any) {
      console.error("Error checking session:", error);
      setIsAuthenticated(false);
      setError(
        error.message ||
          "An unexpected error occurred while checking the session"
      );
      // navigate("/errorpage");
    }
  };

  useEffect(() => {
    if (currentGridNumbers.some((num) => num !== null)) {
      setIsGridReady(true);
    } else {
      setIsGridReady(false);
    }
  }, [currentGridNumbers]);

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
    <div className="flex flex-col items-center m-auto border-4 w-fit shadow-2xl h-fit">
      <div className="flex flex-col md:flex-row justify-around items-center w-full bg-gray-200">
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
            defaultValue={puzzleTitle}
            className="m-2 bg-white border-2 pl-0.5"
            onChange={(e) => handleTitleChange(e)}
          />
        </label>
      </div>
      <div
        className={`flex flex-col md:flex-row border-y-2 w-fit h-auto`}
        style={{ height: `${gridHeight}` }}
      >
        <CrosswordEditorGrid
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
          assignNumbers={assignNumbers}
        />

        {isGridReady && (
          <CreateEditorClues
            gridSize={gridSize}
            currentGridNumbers={currentGridNumbers}
            blackSquares={blackSquares}
            gridDimensions={gridDimensions}
            isFocusedCell={isFocusedCell}
            isFocusedClue={isFocusedClue}
            acrossClueValues={acrossClueValues}
            setAcrossClueValues={setAcrossClueValues}
            downClueValues={downClueValues}
            setDownClueValues={setDownClueValues}
            clueNumDirection={clueNumDirection}
            setClueNumDirection={setClueNumDirection}
            handleFocusClue={handleFocusClue}
            handleUserInputClue={handleUserInputClue}
            handleInputChangeClue={handleInputChangeClue}
            assignNumbers={assignNumbers}
            isClear={isClear}
            mapClues={mapClues}
          />
        )}
      </div>
      <div
        className={`bg-gray-200 border-t-3 w-full`}
        style={{ maxWidth: `${buttonsWidth}` }}
      >
        <div className="flex flex-wrap flex-row items-center gap-4 justify-evenly w-4/6 m-auto py-2">
          <button className="fancyButton bigger" onClick={() => saveGrid()}>
            Save
          </button>
          <button className="fancyButton bigger " onClick={() => handleClear()}>
            Clear
          </button>
          <button className="fancyButton bigger" onClick={() => handleDelete()}>
            Delete
          </button>
          <button
            className="fancyButton bigger"
            onClick={() => handleShareToggle()}
          >
            Share
          </button>
        </div>
      </div>
      {isShare && (
        <div className="flex flex-col items-center bg-gray-200 w-full p-5">
          <p>Please save the grid before sending</p>
          <label htmlFor="recipient" className="text-xl"></label>
          <input
            type="text"
            name="recipient"
            placeholder="Recipient's Username"
            required
            className="border-2 w-1/2 lg:w-1/3 bg-white p-0.5 m-2"
            onChange={(e) => {
              handleInputSend(e);
            }}
          />
          <button
            className="fancyButton"
            tabIndex={1}
            onClick={() => handleSendShare()}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
