export default function CreateClues() {
  const createHint = (name: string, id: string, value: string) => {
    return (
      <li>
        <textarea
          name={name}
          id={id}
          cols={40}
          rows={2}
          defaultValue={value}
          style={{ resize: "none" }}
          wrap="true"
        ></textarea>
      </li>
    );
  };

  return (
    <div className="mt-10">
      <div className="border-2 rounded-sm p-2 mb-2 bg-white min-w-75 h-50 wrap-anywhere m-auto">
        <h4 className="font-bold text-xl">Across:</h4>
        <ol className="mt-3 list-decimal list-inside">
          {createHint("across1", "across1", "The man with a cane")}
          {createHint("across2", "across2", "Banana split?")}
        </ol>
      </div>
      <div className="border-2 rounded-sm p-2 mb-2 bg-white min-w-75  m-auto mt-1">
        <h4 className="font-bold text-xl">Down:</h4>
        <ol className="mt-3 list-decimal list-inside">
          {createHint("across1", "across1", "The man with a cane")}
          {createHint("across2", "across2", "Banana split?")}
          {createHint("across3", "across3", "Capital of Lesotho")}
          {createHint("across4", "across4", "A funny gag")}
        </ol>
      </div>
    </div>
  );
}
