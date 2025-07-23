import { useState, useEffect } from "react";

export default function LandingCrossword() {
  const gridSize: number = 5;
  const [gridDimensions, setGridDimensions] = useState<string>("25vw");
  const [gridHeight, setGridHeight] = useState<string>(gridDimensions + "5px");
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

  const handleCellInteraction = (index: number): void => {
    const newblackSquares: boolean[] = [...blackSquares];
    newblackSquares[index] = !newblackSquares[index];
    setBlackSquares(newblackSquares);
    setCurrentGridNumbers(assignNumbers(newblackSquares));
  };

  const assignNumbers = (blackSquares: boolean[]): number[] => {
    const newNumbers: number[] = Array(gridSize * gridSize).fill(null);
    let number: number = 1;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;

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

  const handleBgColor = (index: number): string => {
    let bgColor: string = "bg-white";
    if (blackSquares && blackSquares[index]) {
      bgColor = "bg-black";
    }
    return bgColor;
  };

  const handleSpaceKey = (
    event: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ): void => {
    event.stopPropagation();
    if (event.key === " ") {
      event.preventDefault();
      handleCellInteraction(index);
    }
  };

  const updateGridDimensions = () => {
    const newWidth: string =
      window.innerWidth < 420
        ? "310px"
        : window.innerWidth < 1024
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
    <div
      className="grid border-3 border-black"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        width: `calc(${gridDimensions} + 5px)`,
        height: gridHeight,
      }}
    >
      {Array.from({ length: gridSize * gridSize }, (_, index) => (
        <div
          key={index}
          onClick={() => handleCellInteraction(index)}
          onKeyDown={(event) => handleSpaceKey(event, index)}
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
