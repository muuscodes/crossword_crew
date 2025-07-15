import { useEffect, useRef } from "react";
import type { CrosswordGridProps } from "../utils/types";

export default function CrosswordGrid(props: CrosswordGridProps) {
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
    isAcrossClueHighlight,
    isFocusedOnGrid,
    setIsFocusedOnGrid,
    currentGridValues,
    setCurrentGridValues,
    handleClear,
    assignNumbers,
  } = props;
  const currentCell = useRef(-1);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(gridSize * gridSize).fill(null)
  );
  const handleCellClick = (index: number): void => {
    const cleanArray: boolean[] = Array(gridSize * gridSize).fill(false);

    if (positionBlackSquares) {
      // Set black squares
      const newblackSquares: boolean[] = [...blackSquares].map((value) => {
        return value;
      });
      newblackSquares[index] = !newblackSquares[index];
      setBlackSquares(newblackSquares);
      setCurrentGridNumbers(assignNumbers(newblackSquares));
      setIsFocusedCell(cleanArray);
      setIsFocusedClue(cleanArray);
      setIsSecondaryFocusedCell(cleanArray);
    } else {
      handleFocus(index, isHighlightAcross, false);
    }
  };

  const handleUserInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const value: string = event.target.value;
    const newGrid: string[] = [...currentGridValues].map((value) => {
      return value;
    });
    newGrid[index] = value.toLocaleUpperCase();
    const inputEvent = event.nativeEvent as InputEvent;
    if (isHighlightAcross && inputEvent.inputType !== "deleteContentBackward") {
      let rightIndex: number = index + 1;
      while (rightIndex < gridSize * gridSize && blackSquares[rightIndex]) {
        rightIndex++;
      }
      if (rightIndex >= gridSize * gridSize) {
        rightIndex = 0;
        while (rightIndex < gridSize * gridSize && blackSquares[rightIndex]) {
          rightIndex++;
        }
      }
      if (rightIndex >= gridSize * gridSize) {
        rightIndex = index;
      }
      handleFocus(rightIndex, isHighlightAcross, false);
    } else if (
      !isHighlightAcross &&
      inputEvent.inputType !== "deleteContentBackward"
    ) {
      let downIndex: number = index + gridSize;
      while (downIndex < gridSize * gridSize && blackSquares[downIndex]) {
        downIndex += gridSize;
      }
      if (downIndex >= gridSize * gridSize) {
        const currentCol = index % gridSize;
        downIndex = currentCol + 1;
        while (downIndex < gridSize * gridSize && blackSquares[downIndex]) {
          downIndex += gridSize;
        }
      }
      if (downIndex >= gridSize * gridSize) {
        downIndex = index;
      }
      handleFocus(downIndex, isHighlightAcross, false);
    }
    setCurrentGridValues(newGrid);
  };

  const handleFocus = (
    index: number,
    isAcrossHighlight: boolean,
    isBackspace: boolean
  ): void => {
    setIsFocusedOnGrid(true);
    const previousCell: number = currentCell.current;
    currentCell.current = index;

    if (!positionBlackSquares && !blackSquares[index]) {
      let newHighlightAcross: boolean = isAcrossHighlight;
      if (previousCell === index && !isBackspace) {
        newHighlightAcross = !isHighlightAcross;
        setIsHighlightAcross(newHighlightAcross);
      }
      // Handle focused cell
      const newFocusGrid: boolean[] = Array(gridSize * gridSize).fill(false);
      newFocusGrid[index] = true;
      setIsFocusedCell(newFocusGrid);

      if (inputRefs.current[index]) {
        inputRefs.current[index]?.focus();
      }

      handleSecondaryFocus(index, newHighlightAcross);
    }
  };

  const handleSecondaryFocus = (index: number, acrossHighlight: boolean) => {
    const newSecondaryFocusGrid: boolean[] = Array(gridSize * gridSize).fill(
      false
    );
    const focusedCellCol: number = index % gridSize;
    const focusedCellRow: number = (index - focusedCellCol) / gridSize;

    // Row secondary highlighting
    const rowSlice: number[] = [];
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
    const colSlice: number[] = [];
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
        if (i === focusedCellRow && acrossHighlight && rowSlice.includes(ind)) {
          newSecondaryFocusGrid[ind] = true;
        }

        // Col highlight
        if (
          j === focusedCellCol &&
          !acrossHighlight &&
          colSlice.includes(ind)
        ) {
          newSecondaryFocusGrid[ind] = true;
        }
      }
    }
    const [dir, newClues, indexInClueList] = handleFocusFromClue(
      rowSlice,
      colSlice,
      index,
      acrossHighlight
    );

    scrollToClue(indexInClueList, dir);
    setIsFocusedClue(newClues);
    setIsSecondaryFocusedCell(newSecondaryFocusGrid);
  };

  const handleFocusFromClue = (
    rowSlice: number[],
    colSlice: number[],
    index: number,
    acrossHighlight: boolean
  ): [string, boolean[], number] => {
    // Handle focused clue
    const newFocusedClues: boolean[] = Array(gridSize * gridSize).fill(false);
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
    if (
      currentGridNumbers[index] &&
      clueNumDirection[index][1] &&
      !acrossHighlight
    ) {
      newFocusedClues[index] = true;
      direction = "down";
      clueListIndex = downIndices.indexOf(index);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Across clue starting from the number
    else if (
      currentGridNumbers[index] &&
      clueNumDirection[index][0] &&
      acrossHighlight
    ) {
      newFocusedClues[index] = true;
      direction = "across";
      clueListIndex = acrossIndices.indexOf(index);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Across clue starting from a down number
    else if (
      currentGridNumbers[index] &&
      clueNumDirection[index][1] &&
      acrossHighlight
    ) {
      newFocusedClues[sortedAcross[0]] = true;
      direction = "across";
      clueListIndex = acrossIndices.indexOf(sortedAcross[0]);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Down clue starting from an across number
    else if (
      currentGridNumbers[index] &&
      clueNumDirection[index][0] &&
      !acrossHighlight
    ) {
      newFocusedClues[sortedDown[0]] = true;
      direction = "down";
      clueListIndex = downIndices.indexOf(sortedDown[0]);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Across clue only one clue in slice
    else if (
      acrossHighlight &&
      !clueNumDirection[index][0] &&
      !clueNumDirection[index][1]
    ) {
      newFocusedClues[sortedAcross[0]] = true;
      direction = "across";
      clueListIndex = acrossIndices.indexOf(sortedAcross[0]);
      return [direction, newFocusedClues, clueListIndex];
    }
    // Down clue only one clue in slice
    else if (
      !acrossHighlight &&
      !clueNumDirection[index][0] &&
      !clueNumDirection[index][1]
    ) {
      newFocusedClues[sortedDown[0]] = true;
      direction = "down";
      clueListIndex = downIndices.indexOf(sortedDown[0]);
      return [direction, newFocusedClues, clueListIndex];
    }
    return [direction, newFocusedClues, clueListIndex];
  };

  const handleBgColor = (index: number): string => {
    let bgColor: string = "bg-white";
    if (blackSquares[index]) {
      bgColor = "bg-black";
    } else if (isFocusedCell[index]) {
      bgColor = "bg-yellow-200";
    } else if (isSecondaryFocusedCell[index]) {
      bgColor = "bg-blue-200";
    }
    return bgColor;
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    const index: number = currentCell.current;
    event.stopPropagation();
    if (event.key === "Backspace" && isFocusedOnGrid) {
      if (currentGridValues[index] === "" && isHighlightAcross) {
        handleArrowLeft(index);
      } else if (currentGridValues[index] === "" && !isHighlightAcross) {
        handleArrowUp(index);
      } else {
        handleFocus(index, isHighlightAcross, true);
      }
    } else if (isFocusedOnGrid) {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          handleArrowUp(index);
          break;

        case "ArrowDown":
          event.preventDefault();
          let downIndex: number = index + gridSize;
          while (downIndex < gridSize * gridSize && blackSquares[downIndex]) {
            downIndex += gridSize;
          }
          if (downIndex >= gridSize * gridSize) {
            const currentCol = index % gridSize;
            if (currentCol === 4) {
              downIndex = 0;
            } else {
              downIndex = currentCol + 1;
            }
            while (downIndex < gridSize * gridSize && blackSquares[downIndex]) {
              downIndex += gridSize;
            }
          }
          if (downIndex >= gridSize * gridSize) {
            downIndex = index;
          }
          handleFocus(downIndex, isHighlightAcross, false);
          break;

        case "ArrowLeft":
          event.preventDefault();
          handleArrowLeft(index);
          break;
        case "ArrowRight":
          event.preventDefault();
          let rightIndex: number = index + 1;
          while (rightIndex < gridSize * gridSize && blackSquares[rightIndex]) {
            rightIndex++;
          }
          if (rightIndex >= gridSize * gridSize) {
            rightIndex = 0;
            while (
              rightIndex < gridSize * gridSize &&
              blackSquares[rightIndex]
            ) {
              rightIndex++;
            }
          }
          if (rightIndex >= gridSize * gridSize) {
            rightIndex = index;
          }
          handleFocus(rightIndex, isHighlightAcross, false);
          break;

        case "Tab":
          event.preventDefault();
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
          if (event.shiftKey) {
            handleShiftTab(index, 0, acrossIndices, downIndices);
          } else {
            handleTab(index, 0, acrossIndices, downIndices);
          }
          break;

        case " ":
          event.preventDefault();
          handleFocus(index, !isHighlightAcross, false);
          break;
        default:
          break;
      }
    }
  };

  const handleArrowLeft = (index: number): void => {
    let leftIndex: number = index - 1;
    while (leftIndex >= 0 && blackSquares[leftIndex]) {
      leftIndex--;
    }
    if (leftIndex < 0) {
      leftIndex = gridSize * gridSize - 1;
      while (leftIndex >= 0 && blackSquares[leftIndex]) {
        leftIndex--;
      }
    }
    if (leftIndex < 0) {
      leftIndex = index;
    }

    handleFocus(leftIndex, isHighlightAcross, false);
  };

  const handleArrowUp = (index: number): void => {
    let upIndex: number = index - gridSize;
    while (upIndex >= 0 && blackSquares[upIndex]) {
      upIndex -= gridSize;
    }
    if (upIndex < 0) {
      const currentCol = index % gridSize;
      if (currentCol === 0) {
        upIndex = gridSize * gridSize - 1;
      } else {
        upIndex = (gridSize - 1) * gridSize + currentCol - 1;
      }
      while (upIndex >= 0 && blackSquares[upIndex]) {
        upIndex -= gridSize;
      }
    }
    if (upIndex < 0) {
      upIndex = index;
    }
    handleFocus(upIndex, isHighlightAcross, false);
  };

  const handleTab = (
    index: number,
    loopCount: number,
    acrossIndices: number[],
    downIndices: number[]
  ): void => {
    const totalCells: number = gridSize * gridSize;

    if (loopCount > 1) {
      return;
    }
    let found: boolean = false;
    for (let i = index + 1; i < totalCells; i++) {
      if (
        isHighlightAcross &&
        currentGridNumbers[i] &&
        acrossIndices.indexOf(i) >= 0
      ) {
        handleFocus(i, isHighlightAcross, false);
        found = true;
        break;
      } else {
        if (
          !isHighlightAcross &&
          currentGridNumbers[i] &&
          downIndices.indexOf(i) >= 0
        ) {
          handleFocus(i, isHighlightAcross, false);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      for (let i = index + 1; i < totalCells; i++) {
        if (
          isHighlightAcross &&
          currentGridNumbers[i] &&
          acrossIndices.indexOf(i) >= 0
        ) {
          handleFocus(i, isHighlightAcross, false);
          found = true;
          break;
        } else {
          if (
            !isHighlightAcross &&
            currentGridNumbers[i] &&
            downIndices.indexOf(i) >= 0
          ) {
            handleFocus(i, isHighlightAcross, false);
            found = true;
            break;
          }
        }
      }
    }
    if (!found) {
      handleTab(-1, loopCount + 1, acrossIndices, downIndices);
    }
  };

  const handleShiftTab = (
    index: number,
    loopCount: number,
    acrossIndices: number[],
    downIndices: number[]
  ): void => {
    const totalCells: number = gridSize * gridSize;

    if (loopCount > 1) {
      return;
    }

    let found: boolean = false;

    for (let i = index - 1; i >= 0; i--) {
      if (
        isHighlightAcross &&
        currentGridNumbers[i] &&
        acrossIndices.indexOf(i) >= 0
      ) {
        handleFocus(i, isHighlightAcross, false);
        found = true;
        break;
      } else {
        if (
          !isHighlightAcross &&
          currentGridNumbers[i] &&
          downIndices.indexOf(i) >= 0
        ) {
          handleFocus(i, isHighlightAcross, false);
          found = true;
          break;
        }
      }
    }
    if (!found) {
      for (let i = index - 1; i >= 0; i--) {
        if (
          isHighlightAcross &&
          currentGridNumbers[i] &&
          acrossIndices.indexOf(i) >= 0
        ) {
          handleFocus(i, isHighlightAcross, false);
          found = true;
          break;
        } else {
          if (
            !isHighlightAcross &&
            currentGridNumbers[i] &&
            downIndices.indexOf(i) >= 0
          ) {
            handleFocus(i, isHighlightAcross, false);
            found = true;
            break;
          }
        }
      }
    }
    if (!found) {
      handleShiftTab(totalCells, loopCount + 1, acrossIndices, downIndices);
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
    const hasNonNullValues: boolean = currentGridNumbers.some(
      (value: number) => value !== null
    );

    // Across clue with across highlighted
    if (
      hasNonNullValues &&
      isHighlightAcross &&
      clueNumDirection[index][0] &&
      !clueNumDirection[index][1]
    ) {
      handleSecondaryFocus(index, true);
    }
    // Down clue with across highlighted
    else if (
      hasNonNullValues &&
      isHighlightAcross &&
      clueNumDirection[index][1] &&
      !clueNumDirection[index][0]
    ) {
      handleSecondaryFocus(index, false);
    }
    // Across clue with down highlighted
    else if (
      hasNonNullValues &&
      !isHighlightAcross &&
      clueNumDirection[index][0] &&
      !clueNumDirection[index][1]
    ) {
      handleSecondaryFocus(index, true);
    }
    // Down clue with down highlighted
    else if (
      hasNonNullValues &&
      !isHighlightAcross &&
      clueNumDirection[index][1] &&
      !clueNumDirection[index][0]
    ) {
      handleSecondaryFocus(index, false);
    }
    // Both across and down clue
    else if (
      hasNonNullValues &&
      clueNumDirection[index][0] &&
      clueNumDirection[index][1]
    ) {
      if (isAcrossClueHighlight) {
        handleSecondaryFocus(index, true);
      } else {
        handleSecondaryFocus(index, false);
      }
    }
  }, [clueToCellHighlight]);

  useEffect(() => {
    handleClear();
  }, [gridSize]);

  return (
    <div
      className="grid border-y-3 border-r-3 border-x-2 border-black w-40vw"
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
                positionBlackSquares ? "cursor-pointer" : ""
              }`}
              onChange={(e) => handleUserInput(e, index)}
              value={
                currentGridValues[index] !== undefined
                  ? currentGridValues[index]
                  : ""
              }
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
