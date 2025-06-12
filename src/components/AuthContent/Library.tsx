import LibraryCard from "./LibraryCard";

export default function Library() {
  return (
    <div className="min-h-screen flex flex-col m-auto w-5/6">
      <h1 className="text-center text-7xl mb-10 mt-5">Library</h1>
      <div className="border-1 w-fit mb-5">
        <p className="inline px-2 text-bold border-r-1">Sort by:</p>
        <select name="sort-library" id="sort-library">
          <option value="author">Author</option>
          <option value="date">Date created ascending</option>
          <option value="author">Date created descending</option>
          <option value="author">Completion</option>
        </select>
      </div>
      <section className="flex flex-row gap-5 mb-15 flex-wrap justify-around">
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
      </section>
    </div>
  );
}
