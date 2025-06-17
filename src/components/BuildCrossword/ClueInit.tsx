export default function ClueInit(
  props: any
): [React.ReactElement[], React.ReactElement[], string[][]] {
  const { gridSize, currentGridNumbers, isFocusedClue } = props;
  let acrossCluesInit: React.ReactElement[] = [];
  let downCluesInit: React.ReactElement[] = [];
  const clueDirectionsInit: string[][] = Array.from(
    { length: gridSize * gridSize },
    () => ["", ""]
  );

  const createClue = (id: string, value: string, index: number) => (
    <li className="flex">
      <p className="font-bold mr-2 w-4 text-right">{id}</p>
      <textarea
        id={id}
        cols={30}
        rows={1}
        defaultValue={value}
        style={{ resize: "none", fontSize: "1.25rem" }}
        wrap="true"
        className={`border-1 ${isFocusedClue[index] ? "bg-blue-200" : ""}`}
      ></textarea>
    </li>
  );

  const initialize = () => {
    let acrossInit: React.ReactElement[] = [];
    let downInit: React.ReactElement[] = [];
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const index = i * gridSize + j;

        if (currentGridNumbers[0] === null) {
          break;
        }
        // Check for horizontal word start
        if (j === 0) {
          clueDirectionsInit[index][0] = "across";

          const newAcrossClue = createClue(
            currentGridNumbers[index]?.toString(),
            "",
            index
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
            index
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
