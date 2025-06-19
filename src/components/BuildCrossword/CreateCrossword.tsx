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
  const [acrossClues, setAcrossClues] = useState<React.ReactElement[]>([]);
  const [downClues, setDownClues] = useState<React.ReactElement[]>([]);
  const [clueNumDirection, setClueNumDirection] = useState<string[][]>([]);
  const [clueToCellHighlight, setClueToCellHighlight] = useState<number>(-1);
  const [isAcrossClueHighlight, setIsAcrossClueHighlight] =
    useState<boolean>(true);
  const [isGridReady, setIsGridReady] = useState<boolean>(false);
  const [isFocusedOnGrid, setIsFocusedOnGrid] = useState<boolean>(false);

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

  const scrollToClue = (index: number, direction: string) => {
    const containerId =
      direction === "across"
        ? "scrollableContainerAcross"
        : "scrollableContainerDown";
    const container = document.getElementById(containerId);
    const clueElement = container?.querySelector("ul")?.children[index];
    if (clueElement) {
      clueElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    if (currentGridNumbers.some((num) => num !== null)) {
      setIsGridReady(true);
    } else {
      setIsGridReady(false);
    }
  }, [currentGridNumbers]);

  return (
    <div className="flex flex-col items-center m-auto border-4 w-fit">
      <div className="flex flex-col md:flex-row justify-around items-center w-full">
        <div>
          <label className="text-xl mr-1" htmlFor="gridSize">
            Grid Size:
          </label>
          <select
            name="gridSize"
            id="gridSize"
            value={gridSize}
            onChange={handleGridSizeChange}
            className="border-1 text-xl"
          >
            <option value="5">5</option>
            <option value="7">7</option>
            <option value="9">9</option>
            <option value="11">11</option>
            <option value="13">13</option>
            <option value="15">15</option>
          </select>
        </div>
        <label className="text-xl flex items-center">
          Set Black Squares
          <input
            type="checkbox"
            id="checkbox"
            className="m-2 custom-checkbox"
            onClick={handleBlackSquaresChange}
          />
        </label>
      </div>
      <div
        className={`flex flex-col md:flex-row border-2 w-fit`}
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
        />

        {isGridReady && (
          <CreateClues
            gridSize={gridSize}
            currentGridNumbers={currentGridNumbers}
            blackSquares={blackSquares}
            gridDimensions={gridDimensions}
            isFocusedCell={isFocusedCell}
            setIsFocusedCell={setIsFocusedCell}
            isFocusedClue={isFocusedClue}
            setIsFocusedClue={setIsFocusedClue}
            acrossClues={acrossClues}
            setAcrossClues={setAcrossClues}
            downClues={downClues}
            setDownClues={setDownClues}
            clueNumDirection={clueNumDirection}
            setClueNumDirection={setClueNumDirection}
            setClueToCellHighlight={setClueToCellHighlight}
            setIsAcrossClueHighlight={setIsAcrossClueHighlight}
            isFocusedOnGrid={isFocusedOnGrid}
            setIsFocusedOnGrid={setIsFocusedOnGrid}
          />
        )}
      </div>
      <div className="flex flex-row justify-evenly w-full">
        <button className="hover:opacity-60 focus:opacity-60 hover:scale-105 focus:scale-105 text-xl p-2">
          Save
        </button>
        <button className="hover:opacity-60 focus:opacity-60 hover:scale-105 focus:scale-105 text-xl p-2">
          Clear
        </button>
        <button className="hover:opacity-60 focus:opacity-60 hover:scale-105 focus:scale-105 text-xl p-2">
          Share
        </button>
      </div>
    </div>
  );
}
