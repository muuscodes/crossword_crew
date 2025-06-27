import CreateEditorCrossword from "./CreateEditorCrossword";

export default function Editor() {
  return (
    <div className="min-h-[80vh] items-center text-center mb-15">
      <h1 className="text-center text-7xl my-5">Edit</h1>
      <CreateEditorCrossword />
    </div>
  );
}
