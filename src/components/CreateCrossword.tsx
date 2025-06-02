import { useState } from "react";
import CrosswordGrid from "./CrosswordGrid";

export default function CreateCrossword() {
  const [gridSize, setGridSize] = useState<number>(9);
  const [gridDimensions, setGridDimensions] = useState<string>("30vw");

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value);
    switch (value) {
      case 5:
        setGridDimensions("25vw");
        break;
      case 7:
        setGridDimensions("25vw");
        break;
      case 9:
        setGridDimensions("30vw");
        break;
      case 11:
        setGridDimensions("30vw");
        break;
      case 13:
        setGridDimensions("35vw");
        break;
      case 15:
        setGridDimensions("35vw");
        break;
      default:
        setGridDimensions("30vw");
        break;
    }
    setGridSize(value);
  };

  return (
    <div className="flex-col justify-between items-center gap-5 mt-10">
      <div>
        <label htmlFor="gridSize">Select Grid Size:</label>
        <select
          name="gridSize"
          id="gridSize"
          value={gridSize}
          onChange={handleInputChange}
        >
          <option value="5">5</option>
          <option value="7">7</option>
          <option value="9">9</option>
          <option value="11">11</option>
          <option value="13">13</option>
          <option value="15">15</option>
        </select>
      </div>
      <CrosswordGrid gridSize={gridSize} gridDimensions={gridDimensions} />
    </div>
  );
}
