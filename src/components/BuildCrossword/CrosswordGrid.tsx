import { useEffect, useState } from "react";

// Interface

export default function CrosswordGrid(props: any) {
  const { gridSize, gridDimensions, positionBlackSquares, addInputs } = props;
  const [cellClickedNum, setCellClickedNum] = useState<number>(0);
  const [clickedCells, setClickedCells] = useState<boolean[]>(
    Array(gridSize * gridSize).fill(false)
  );
  const [currentGridValues, setCurrentGridValues] = useState<string[]>(
    Array(gridSize * gridSize).fill("")
  );
  const [currentGridNumbers, setCurrentGridNumbers] = useState<number[]>(
    Array(gridSize * gridSize).fill(null)
  );
  const [isFocused, setIsFocused] = useState<boolean[]>(
    Array(gridSize * gridSize).fill(false)
  );
  const [isSecondaryFocused, setIsSecondaryFocused] = useState<boolean[]>(
    Array(gridSize * gridSize).fill(false)
  );
  const [isHighlightAcross, setIsHighlightAcross] = useState<boolean>(false);

  const handleCellClick = (index: number) => {
    setCellClickedNum(cellClickedNum + 1);
    const cleanArray = Array(gridSize * gridSize).fill(false);

    if (positionBlackSquares) {
      // Set black squares
      const newClickedCells = [...clickedCells];
      newClickedCells[index] = !newClickedCells[index];
      setClickedCells(newClickedCells);
      setCurrentGridNumbers(assignNumbers(newClickedCells));

      setIsFocused(cleanArray);
      setIsSecondaryFocused(cleanArray);
    } else if (cellClickedNum > 1) {
      setIsSecondaryFocused(cleanArray);
      setIsHighlightAcross(!isHighlightAcross);
      handleFocus(index);
    }
  };

  const assignNumbers = (clickedCells: boolean[]) => {
    const newNumbers = Array(gridSize * gridSize).fill(null);
    let number = 1;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;

        // Check if the cell is a black square
        if (clickedCells[index]) {
          continue; // Skip black squares
        }

        // Check for horizontal word start
        if (j === 0 || (i < gridSize && clickedCells[index - gridSize])) {
          newNumbers[index] = number++;
        }

        // Check for vertical word start
        if (
          i === 0 ||
          (j < gridSize &&
            !clickedCells[index - gridSize] &&
            clickedCells[index - 1])
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
    setCellClickedNum(0);
    if (!positionBlackSquares) {
      // Handle focused cell
      const newFocusGrid = Array(gridSize * gridSize).fill(false);
      newFocusGrid[index] = true;
      setIsFocused(newFocusGrid);

      // Handle secondarily focused cells
      const newSecondaryFocusGrid = Array(gridSize * gridSize).fill(false);
      const focusedCellCol = index % gridSize;
      const focusedCellRow = (index - focusedCellCol) / gridSize;

      // Row secondary highlighting
      const rowSlice = [];
      for (let k = 1; k < gridSize + 1; k++)
        if (focusedCellCol === 0 || index - k == undefined) {
          break;
        } else if (
          clickedCells[index - k] ||
          (index - k + 1) % gridSize === 0
        ) {
          break;
        } else {
          rowSlice.push(index - k);
        }

      for (let l = 1; l < gridSize; l++)
        if (focusedCellCol === gridSize - 1 || index + l == undefined) {
          break;
        } else if (clickedCells[index + l] || (index + l) % gridSize === 0) {
          break;
        } else {
          rowSlice.push(index + l);
        }

      // Col secondary highlighting
      const colSlice = [];
      for (let k = 1; k < gridSize + 1; k++)
        if (focusedCellRow === 0 || index - k * gridSize == undefined) {
          break;
        } else if (clickedCells[index - k * gridSize]) {
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
        } else if (clickedCells[index + l * gridSize]) {
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
          if (clickedCells[ind]) {
            continue;
          }

          // Row highlight
          if (
            i === focusedCellRow &&
            isHighlightAcross &&
            rowSlice.includes(ind)
          ) {
            newSecondaryFocusGrid[ind] = true;
          }

          // Col highlight
          if (
            j === focusedCellCol &&
            !isHighlightAcross &&
            colSlice.includes(ind)
          ) {
            newSecondaryFocusGrid[ind] = true;
          }
        }
      }
      setIsSecondaryFocused(newSecondaryFocusGrid);
    }
  };

  const handleBgColor = (index: number) => {
    let bgColor = "bg-white";
    if (clickedCells[index]) {
      bgColor = "bg-black";
    } else if (isFocused[index]) {
      bgColor = "bg-yellow-200";
    } else if (isSecondaryFocused[index]) {
      bgColor = "bg-blue-200";
    }

    return bgColor;
  };

  useEffect(() => {
    const cleanArray = Array(gridSize * gridSize).fill(false);
    setClickedCells(cleanArray);
    setCurrentGridNumbers(assignNumbers(cleanArray));
    setIsFocused(cleanArray);
    setIsSecondaryFocused(cleanArray);
  }, [gridSize]);

  return (
    <div
      className="grid border-3 border-black rounded shadow-lg m-auto mt-10"
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
          className={`flex border border-black rounded relative 
          ${handleBgColor(index)}`}
          style={{
            height: `calc(${gridDimensions}/${gridSize})`,
            width: `calc(${gridDimensions}/${gridSize})`,
            fontSize: `calc((${gridDimensions} / ${gridSize}) / 2)`,
          }}
        >
          <div
            style={{
              fontSize: `calc((${gridDimensions} / ${gridSize}) / 4)`,
            }}
          >
            {currentGridNumbers[index]}
          </div>
          {!clickedCells[index] && addInputs && (
            <input
              type="text"
              maxLength={1}
              className={`w-full h-full text-center absolute top-0 left-0`}
              onChange={(e) => handleUserInput(e, index)}
              onFocus={() => handleFocus(index)}
              value={currentGridValues[index]}
            />
          )}
        </div>
      ))}
    </div>
  );
}
