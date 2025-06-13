export default function ClueInit(
  props: any
): [React.ReactElement[], React.ReactElement[], string[][]] {
  const { gridSize, currentGridNumbers } = props;
  const acrossCluesInit: React.ReactElement[] = [];
  const downCluesInit: React.ReactElement[] = [];
  const clueDirectionsInit: string[][] = Array.from(
    { length: gridSize * gridSize },
    () => ["", ""]
  );

  const createClue = (id: string | null) => {
    if (id !== null) {
      return (
        <li className="flex">
          <p className="font-bold mr-2">{id}</p>
          <textarea
            id={id}
            cols={40}
            rows={2}
            defaultValue={"Enter a clue!"}
            style={{ resize: "none" }}
            wrap="true"
            className="border-1"
          ></textarea>
        </li>
      );
    }
    return null;
  };

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const index = i * gridSize + j;

      // Check for horizontal word start
      if (j === 0) {
        clueDirectionsInit[index][0] = "across";
        const newAcrossClue = createClue(currentGridNumbers[index]?.toString());
        if (newAcrossClue) {
          acrossCluesInit.push(newAcrossClue);
        }
      }

      // Check for vertical word start
      if (i === 0) {
        clueDirectionsInit[index][1] = "down";
        const newDownClue = createClue(currentGridNumbers[index]?.toString());
        if (newDownClue) {
          downCluesInit.push(newDownClue);
        }
      }
    }
  }

  return [acrossCluesInit, downCluesInit, clueDirectionsInit];
}
