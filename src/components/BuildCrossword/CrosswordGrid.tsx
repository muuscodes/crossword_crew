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
    isFocusedClue,
    setIsFocusedClue,
    isSecondaryFocusedCell,
    setIsSecondaryFocusedCell,
    isHighlightAcross,
    setIsHighlightAcross,
    clueNumDirection,
  } = props;
  const currentCell = useRef(-1);
  const [currentGridValues, setCurrentGridValues] = useState<string[]>(
    Array(gridSize * gridSize).fill("")
  );

  const handleCellInteraction = (
    index: number
    // event?: React.MouseEvent | React.KeyboardEvent
  ) => {
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

      // Handle focused clue
      const newFocusedClues = Array(gridSize * gridSize).fill(false);
      newFocusedClues[index] = true;
      setIsFocusedClue(newFocusedClues);

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
      } else {
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
    setIsSecondaryFocusedCell(newSecondaryFocusGrid);
  };

  const handleBgColor = (index: number) => {
    let bgColor = "bg-white";
    // if (isFocusedClue[index]) {
    //   const newFocusedCells = Array(gridSize * gridSize).fill(false);
    //   newFocusedCells[index] = true;
    //   const dir = clueNumDirection[index][0] || clueNumDirection[index][0];
    //   if (dir === "across") handleSecondaryFocus(index, true);
    //   if (dir === "down") handleSecondaryFocus(index, false);
    // }
    if (blackSquares && blackSquares[index]) {
      bgColor = "bg-black";
    } else if (isFocusedCell[index]) {
      bgColor = "bg-yellow-200";
    } else if (isSecondaryFocusedCell[index]) {
      bgColor = "bg-blue-200";
    }
    return bgColor;
  };

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
          onClick={() => handleCellInteraction(index)}
          // onKeyDown={(e) => {
          //   if (e.key === "Enter" || e.key === " ") {
          //     handleCellInteraction(index, e);
          //   }
          // }}
          tabIndex={0}
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
            />
          )}
        </div>
      ))}
    </div>
  );
}
