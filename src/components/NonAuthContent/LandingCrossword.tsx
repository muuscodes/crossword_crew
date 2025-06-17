import { useState } from "react";

export default function LandingCrossword() {
  const gridSize = 5;
  const gridDimensions = "25vw";
  const [currentGridNumbers, setCurrentGridNumbers] = useState<
    (number | null)[]
  >([
    1,
    2,
    3,
    4,
    5,
    6,
    null,
    null,
    null,
    null,
    7,
    null,
    null,
    null,
    null,
    8,
    null,
    null,
    null,
    null,
    9,
    null,
    null,
    null,
    null,
  ]);
  const [blackSquares, setBlackSquares] = useState<boolean[]>(
    Array(gridSize * gridSize).fill(false)
  );

  const handleCellInteraction = (index: number) => {
    // Set black squares
    const newblackSquares = [...blackSquares];
    newblackSquares[index] = !newblackSquares[index];
    setBlackSquares(newblackSquares);
    setCurrentGridNumbers(assignNumbers(newblackSquares));
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

  const handleBgColor = (index: number) => {
    let bgColor = "bg-white";
    if (blackSquares && blackSquares[index]) {
      bgColor = "bg-black";
    }
    return bgColor;
  };

  console.log(currentGridNumbers);

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
          tabIndex={0}
          className={`flex border border-black relative 
          ${handleBgColor(index)}`}
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
        </div>
      ))}
    </div>
  );
}
