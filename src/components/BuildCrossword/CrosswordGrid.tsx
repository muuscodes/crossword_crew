import { useEffect, useState, useRef } from "react";

export default function CrosswordGrid(props: any) {
  const {
    gridSize,
    gridDimensions,
    positionBlackSquares,
    addInputs,
    currentGridNumbers,
    setCurrentGridNumbers,
    blackSquares,
    setBlackSquares,
    isFocusedCell,
    setIsFocusedCell,
    setIsFocusedClue,
    isSecondaryFocusedCell,
    setIsSecondaryFocusedCell,
    isHighlightAcross,
    setIsHighlightAcross,
    clueNumDirection,
    scrollToClue,
    clueToCellHighlight,
  } = props;
  const currentCell = useRef(-1);
  const [currentGridValues, setCurrentGridValues] = useState<string[]>(
    Array(gridSize * gridSize).fill("")
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(gridSize * gridSize).fill(null)
  );

  const handleCellClick = (index: number) => {
    const cleanArray = Array(gridSize * gridSize).fill(false);

    if (positionBlackSquares) {
      // Set black squares
      const newblackSquares = [...blackSquares];
      newblackSquares[index] = !newblackSquares[index];
      setBlackSquares(newblackSquares);
      setCurrentGridNumbers(assignNumbers(newblackSquares));

      setIsFocusedCell(cleanArray);
      setIsSecondaryFocusedCell(cleanArray);
    } else {
      handleFocus(index);
    }
  };

  const assignNumbers = (blackSquares: boolean[]) => {
    const newNumbers = Array(gridSize * gridSize).fill(null);
    let number = 1;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;

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

  const handleUserInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.target.value;
    const newGrid = [...currentGridValues];
    newGrid[index] = value;
    setCurrentGridValues(newGrid);
  };

  const handleFocus = (index: number) => {
    const previousCell: number = currentCell.current;
    currentCell.current = index;

    if (!positionBlackSquares && !blackSquares[index]) {
      let newHighlightAcross: boolean = isHighlightAcross;
      if (previousCell === index) {
        newHighlightAcross = !isHighlightAcross;
        setIsHighlightAcross(newHighlightAcross);
      }
      // Handle focused cell
      const newFocusGrid = Array(gridSize * gridSize).fill(false);
      newFocusGrid[index] = true;
      setIsFocusedCell(newFocusGrid);

      if (inputRefs.current[index]) {
        inputRefs.current[index]?.focus();
      }

      handleSecondaryFocus(index, newHighlightAcross);
    }
  };

  const handleSecondaryFocus = (index: number, highlight: boolean) => {
    // Handle secondarily focused cells
    const newSecondaryFocusGrid = Array(gridSize * gridSize).fill(false);
    const focusedCellCol = index % gridSize;
    const focusedCellRow = (index - focusedCellCol) / gridSize;

    // Row secondary highlighting
    const rowSlice = [];
    for (let k = 1; k < gridSize + 1; k++)
      if (focusedCellCol === 0 || index - k == undefined) {
        break;
      } else if (blackSquares[index - k] || (index - k + 1) % gridSize === 0) {
        break;
      } else {
        rowSlice.push(index - k);
      }

    for (let l = 1; l < gridSize; l++)
      if (focusedCellCol === gridSize - 1 || index + l == undefined) {
        break;
      } else if (blackSquares[index + l] || (index + l) % gridSize === 0) {
        break;
      } else {
        rowSlice.push(index + l);
      }

    // Col secondary highlighting
    const colSlice = [];
    for (let k = 1; k < gridSize + 1; k++)
      if (focusedCellRow === 0 || index - k * gridSize == undefined) {
        break;
      } else if (blackSquares[index - k * gridSize]) {
        break;
      } else if (
        index - k * gridSize >= 0 &&
        index - k * gridSize < gridSize * gridSize
      ) {
        colSlice.push(index - k * gridSize);
      }

    for (let l = 1; l < gridSize; l++)
      if (
        focusedCellRow === gridSize - 1 ||
        index + l * gridSize == undefined
      ) {
        break;
      } else if (blackSquares[index + l * gridSize]) {
        break;
      } else {
        colSlice.push(index + l * gridSize);
      }

    // Putting it all together
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const ind = i * gridSize + j;

        // Skip focused cell
        if (ind === index) {
          continue;
        }

        // Skip black squares
        if (blackSquares[ind]) {
          continue;
        }

        // Row highlight
        if (i === focusedCellRow && highlight && rowSlice.includes(ind)) {
          newSecondaryFocusGrid[ind] = true;
        }

        // Col highlight
        if (j === focusedCellCol && !highlight && colSlice.includes(ind)) {
          newSecondaryFocusGrid[ind] = true;
        }
      }
    }
    const [dir, newClues, indexInClueList] = handleFocusClue(
      rowSlice,
      colSlice,
      index,
      highlight
    );

    scrollToClue(indexInClueList, dir);
    setIsFocusedClue(newClues);
    setIsSecondaryFocusedCell(newSecondaryFocusGrid);
  };

  const handleFocusClue = (
    rowSlice: number[],
    colSlice: number[],
    index: number,
    highlight: boolean
  ) => {
    // Handle focused clue
    const newFocusedClues = Array(gridSize * gridSize).fill(false);
    const sortedAcross: number[] = rowSlice.sort((a, b) => a - b);
    const sortedDown: number[] = colSlice.sort((a, b) => a - b);
    let direction: string = "";
    let clueListIndex: number = 0;
    const acrossIndices: number[] = [];
    const downIndices: number[] = [];
    clueNumDirection.forEach((item: string[], index: number) => {
      if (item[0] === "across") {
        acrossIndices.push(index);
      }
      if (item[1] === "down") {
        downIndices.push(index);
      }
    });

    // Down clue starting from the number
    if (currentGridNumbers[index] && clueNumDirection[index][1] && !highlight) {
      console.log("In first down");
      newFocusedClues[index] = true;
      direction = "down";
      clueListIndex = downIndices.indexOf(index);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Across clue starting from the number
    else if (
      currentGridNumbers[index] &&
      clueNumDirection[index][0] &&
      highlight
    ) {
      console.log("In first across");
      newFocusedClues[index] = true;
      direction = "across";
      clueListIndex = acrossIndices.indexOf(index);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Across clue starting from a down number
    else if (
      currentGridNumbers[index] &&
      clueNumDirection[index][1] &&
      highlight
    ) {
      console.log("In second across");
      newFocusedClues[sortedAcross[0]] = true;
      direction = "across";
      clueListIndex = acrossIndices.indexOf(sortedAcross[0]);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Down clue starting from an across number
    else if (
      currentGridNumbers[index] &&
      clueNumDirection[index][0] &&
      !highlight
    ) {
      console.log("In second down");
      newFocusedClues[sortedDown[0]] = true;
      direction = "down";
      clueListIndex = downIndices.indexOf(sortedDown[0]);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Across clue only one clue in slice
    else if (
      highlight &&
      !clueNumDirection[index][0] &&
      !clueNumDirection[index][1]
    ) {
      console.log("In last across");
      newFocusedClues[sortedAcross[0]] = true;
      direction = "across";
      clueListIndex = acrossIndices.indexOf(sortedAcross[0]);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Down clue only one clue in slice
    else if (
      !highlight &&
      !clueNumDirection[index][0] &&
      !clueNumDirection[index][1]
    ) {
      console.log("In last down");
      newFocusedClues[sortedDown[0]] = true;
      direction = "down";
      clueListIndex = downIndices.indexOf(sortedDown[0]);
      return [direction, newFocusedClues, clueListIndex];
    }
    return [direction, newFocusedClues, clueListIndex];
  };

  const handleBgColor = (index: number) => {
    let bgColor = "bg-white";
    if (blackSquares && blackSquares[index]) {
      bgColor = "bg-black";
    } else if (isFocusedCell[index]) {
      bgColor = "bg-yellow-200";
    } else if (isSecondaryFocusedCell[index]) {
      bgColor = "bg-blue-200";
    }
    return bgColor;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const index = currentCell.current;

    switch (event.key) {
      case "ArrowUp":
        if (index - gridSize >= 0) handleFocus(index - gridSize);
        break;
      case "ArrowDown":
        if (index + gridSize < gridSize * gridSize)
          handleFocus(index + gridSize);
        break;
      case "ArrowLeft":
        if (index % gridSize > 0) handleFocus(index - 1);
        break;
      case "ArrowRight":
        if (index % gridSize < gridSize - 1) handleFocus(index + 1);
        break;
      case "Tab":
        event.preventDefault(); // Prevent default tab behavior
        // Logic to move to the next available clue can be added here
        break;
      case " ":
        event.preventDefault(); // Prevent default space behavior
        setIsHighlightAcross(!isHighlightAcross); // Toggle between across and down
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleKeyDownWrapper = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener("keydown", handleKeyDownWrapper);

    return () => {
      window.removeEventListener("keydown", handleKeyDownWrapper);
    };
  }, []);

  useEffect(() => {
    const index: number = clueToCellHighlight;
    const hasNonNullValues = currentGridNumbers.some(
      (value: number) => value !== null
    );
    if (hasNonNullValues && isHighlightAcross) {
      handleSecondaryFocus(index, true);
    } else if (hasNonNullValues && !isHighlightAcross) {
      handleSecondaryFocus(index, false);
    }
  }, [clueToCellHighlight]);

  useEffect(() => {
    const cleanArray = Array(gridSize * gridSize).fill(false);
    setBlackSquares(cleanArray);
    const newNumbers = assignNumbers(cleanArray);
    setCurrentGridNumbers(newNumbers);
    setIsFocusedCell(cleanArray);
    setIsSecondaryFocusedCell(cleanArray);
  }, [gridSize]);

  return (
    <div
      className="grid border-3 border-black"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        width: `calc(${gridDimensions} + 5px)`,
        height: `calc(${gridDimensions} + 5px)`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }, (_, index) => (
        <div
          key={index}
          onClick={() => handleCellClick(index)}
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e as unknown as KeyboardEvent)}
          className={`flex border border-black relative 
          ${handleBgColor(index)} `}
          style={{
            height: `calc(${gridDimensions}/${gridSize})`,
            width: `calc(${gridDimensions}/${gridSize})`,
            fontSize: `calc((${gridDimensions} / ${gridSize}) / 2)`,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: `calc((${gridDimensions} / ${gridSize}) / 4)`,
            }}
          >
            {currentGridNumbers[index]}
          </div>
          {!blackSquares[index] && addInputs && (
            <input
              type="text"
              maxLength={1}
              className={`w-full h-full text-center absolute top-0 left-0 ${
                positionBlackSquares ? "cursor-pointer text-white" : ""
              }`}
              onChange={(e) => handleUserInput(e, index)}
              value={currentGridValues[index]}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
