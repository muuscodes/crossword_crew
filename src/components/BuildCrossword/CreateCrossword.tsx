import { useState, useEffect } from "react";
import CrosswordGrid from "./CrosswordGrid";
import CreateClues from "./CreateClues";

export default function CreateCrossword() {
  const [gridSize, setGridSize] = useState<number>(5);
  const [gridDimensions, setGridDimensions] = useState<string>("30vw");
  const [positionBlackSquares, setPositionBlackSquares] =
    useState<boolean>(false);
  const [currentGridNumbers, setCurrentGridNumbers] = useState<number[]>(
    Array(gridSize * gridSize).fill(null)
  );
  const [blackSquares, setBlackSquares] = useState<boolean[]>(
    Array(gridSize * gridSize).fill(false)
  );
  const [isGridReady, setIsGridReady] = useState<boolean>(false);

  const handleGridSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = parseInt(event.target.value);
    setGridDimensions(value <= 7 ? "30vw" : value <= 11 ? "35vw" : "40vw");
    setGridSize(value);
    setCurrentGridNumbers(Array(value * value).fill(null));
    setBlackSquares(Array(value * value).fill(false));
    setIsGridReady(false);
  };

  const handleBlackSquaresChange = () => {
    setPositionBlackSquares(!positionBlackSquares);
  };

  useEffect(() => {
    if (currentGridNumbers.some((num) => num !== null)) {
      setIsGridReady(true);
    } else {
      setIsGridReady(false); // Reset if no numbers are populated
    }
  }, [currentGridNumbers]);

  return (
    <div className="flex flex-col items-center gap-5 m-4">
      <div>
        <label htmlFor="gridSize">Select Grid Size:</label>
        <select
          name="gridSize"
          id="gridSize"
          value={gridSize}
          onChange={handleGridSizeChange}
        >
          <option value="5">5</option>
          <option value="7">7</option>
          <option value="9">9</option>
          <option value="11">11</option>
          <option value="13">13</option>
          <option value="15">15</option>
        </select>
      </div>
      <div>
        <button
          className={`border-2 border-black hover:bg-red-400 p-2 ${
            positionBlackSquares ? "bg-black text-white" : "bg-white"
          }`}
          onClick={handleBlackSquaresChange}
        >
          Set black squares
        </button>
      </div>
      <div
        className={`flex border-1 w-fit`}
        style={{ height: `calc(${gridDimensions} + 5px)` }}
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
        />

        {isGridReady && (
          <CreateClues
            gridSize={gridSize}
            currentGridNumbers={currentGridNumbers}
            blackSquares={blackSquares}
            gridDimensions={gridDimensions}
          />
        )}
      </div>
    </div>
  );
}
