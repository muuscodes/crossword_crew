export default function ClueInit(
  props: any
): [React.ReactElement[], React.ReactElement[], string[][]] {
  const {
    gridSize,
    currentGridNumbers,
    isFocusedClue,
    isFocusedCell,
    clueNumDirection,
    handleFocusClue,
    handleInputChangeClue,
  } = props;
  let acrossCluesInit: React.ReactElement[] = [];
  let downCluesInit: React.ReactElement[] = [];
  const clueDirectionsInit: string[][] = Array.from(
    { length: gridSize * gridSize },
    () => ["", ""]
  );

  const createClue = (
    id: string,
    value: string,
    index: number,
    direction: string
  ) => {
    let isHighlight: boolean = false;
    const focusedCellIndex: number = isFocusedCell.indexOf(true);
    const indexOf100: number = currentGridNumbers.indexOf(100);
    const isThreeNumbered: boolean = indexOf100 > 0;

    if (
      isFocusedClue[index] &&
      clueNumDirection[index][0] &&
      clueNumDirection[index][1]
    ) {
      if (isFocusedCell[index] == isFocusedClue[index]) {
        isHighlight = true;
      } else if (focusedCellIndex < index + gridSize && direction === "down") {
        isHighlight = false;
      } else if (
        focusedCellIndex < index + gridSize &&
        direction === "across"
      ) {
        isHighlight = true;
      } else if (focusedCellIndex >= index + gridSize && direction === "down") {
        isHighlight = true;
      } else if (
        focusedCellIndex >= index + gridSize &&
        direction === "across"
      ) {
        isHighlight = false;
      }
    } else if (isFocusedClue[index]) {
      isHighlight = true;
    }

    return (
      <li className="flex">
        <p
          className={`font-bold w-4 text-right ${
            isThreeNumbered ? "mr-5" : "mr-2"
          }`}
        >
          {id}
        </p>
        <textarea
          id={id + direction}
          cols={30}
          rows={1}
          tabIndex={0}
          maxLength={50}
          defaultValue={value}
          style={{ resize: "none", fontSize: "1.25rem" }}
          wrap="true"
          className={`border-1 ${isThreeNumbered ? "w-6/8" : "w-7/8"} ${
            isHighlight ? "bg-blue-200" : ""
          }`}
          onFocus={() => handleFocusClue(index, direction)}
          onChange={(e) => handleInputChangeClue(e, direction, index)}
        ></textarea>
      </li>
    );
  };

  const initialize = (): void => {
    let acrossInit: React.ReactElement[] = [];
    let downInit: React.ReactElement[] = [];
    const nullGrid: boolean = !currentGridNumbers.some(
      (num: number) => num !== null
    );

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;

        if (nullGrid) {
          break;
        }

        // Check for horizontal word start
        if (j === 0) {
          clueDirectionsInit[index][0] = "across";

          const newAcrossClue = createClue(
            currentGridNumbers[index]?.toString(),
            "",
            index,
            "across"
          );
          if (newAcrossClue) {
            acrossInit.push(newAcrossClue);
          }
        }

        // Check for vertical word start
        if (i === 0) {
          clueDirectionsInit[index][1] = "down";
          const newDownClue = createClue(
            currentGridNumbers[index]?.toString(),
            "",
            index,
            "down"
          );
          if (newDownClue) {
            downInit.push(newDownClue);
          }
        }
      }
    }
    acrossCluesInit = acrossInit;
    downCluesInit = downInit;
  };

  initialize();

  return [acrossCluesInit, downCluesInit, clueDirectionsInit];
}
