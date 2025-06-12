import { useState } from "react";
import CrosswordGrid from "./CrosswordGrid";
import CreateClues from "./CreateClues";

export default function CreateCrossword() {
  const [gridSize, setGridSize] = useState<number>(5);
  const [gridDimensions, setGridDimensions] = useState<string>("30vw");
  const [positionBlackSquares, setPositionBlackSquares] =
    useState<boolean>(false);

  const handleGridSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = parseInt(event.target.value);
    switch (value) {
      case 5:
        setGridDimensions("30vw");
        break;
      case 7:
        setGridDimensions("30vw");
        break;
      case 9:
        setGridDimensions("35vw");
        break;
      case 11:
        setGridDimensions("35vw");
        break;
      case 13:
        setGridDimensions("40vw");
        break;
      case 15:
        setGridDimensions("40vw");
        break;
      default:
        setGridDimensions("30vw");
        break;
    }
    setGridSize(value);
  };

  const handleBlackSquaresChange = () => {
    setPositionBlackSquares(!positionBlackSquares);
  };

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
      <div className="flex flex-row justify-between w-2/3">
        <CrosswordGrid
          gridSize={gridSize}
          gridDimensions={gridDimensions}
          positionBlackSquares={positionBlackSquares}
          addInputs={true}
        />
        <CreateClues />
      </div>
    </div>
  );
}
