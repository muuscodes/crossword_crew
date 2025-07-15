import { useState } from "react";
import CreateSolverCrossword from "./CreateSolverCrossword";

export default function Solver() {
  const [isSolved, setIsSolved] = useState<boolean>(false);

  return (
    <div className="min-h-[80vh] items-center text-center mb-15">
      <p
        className={`text-3xl m-auto mb-3 p-2 w-fit ${
          isSolved ? "bg-black text-white" : ""
        } `}
      >
        {isSolved ? `Puzzle Solved!` : ""}
      </p>
      <CreateSolverCrossword setIsSolved={setIsSolved} />
    </div>
  );
}
