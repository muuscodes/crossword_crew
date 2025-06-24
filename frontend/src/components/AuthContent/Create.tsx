import { useState } from "react";
import CreateCrossword from "../BuildCrossword/CreateCrossword";

export default function Create() {
  const [isSaved, setIsSaved] = useState<boolean>(false);

  return (
    <div className="min-h-[80vh] items-center text-center mb-15">
      <h1 className="text-center text-7xl my-5">Create</h1>
      <p className="text-xl m-auto mb-3 h-fit">
        {isSaved ? `Puzzle Saved!` : ""}
      </p>
      <CreateCrossword setIsSaved={setIsSaved} />
    </div>
  );
}
