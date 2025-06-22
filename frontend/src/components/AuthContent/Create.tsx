import CreateCrossword from "../BuildCrossword/CreateCrossword";

export default function Create() {
  return (
    <div className="min-h-screen items-center mb-15">
      <h1 className="text-center text-7xl mb-10 mt-5">Create</h1>
      <CreateCrossword />
    </div>
  );
}
