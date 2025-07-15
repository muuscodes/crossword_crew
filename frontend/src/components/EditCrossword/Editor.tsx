import { useState } from "react";
import CreateEditorCrossword from "./CreateEditorCrossword";

export default function Editor() {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");

  return (
    <div className="min-h-[80vh] items-center text-center mb-15">
      <h1 className="text-center text-7xl my-5">Edit</h1>
      <p className="text-xl m-auto mb-3 h-fit">
        {isSaved ? `Puzzle Saved!` : ""}
        {userMessage ? userMessage : ""}
      </p>
      <CreateEditorCrossword
        setIsSaved={setIsSaved}
        setUserMessage={setUserMessage}
      />
    </div>
  );
}
