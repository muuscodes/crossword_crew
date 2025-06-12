import Logo from "../../img/favicon.jpg";

export default function LibraryCard(props: any) {
  const { author, date, completed } = props;
  return (
    <div className="flex flex-col items-center border-2 p-5 w-90 h-auto bg-black text-white">
      <a
        href="/library"
        target="_self"
        id="library-logo"
        aria-label="Crossword crew library page"
        className="block w-2/3 h-auto"
      >
        <img src={Logo} alt="Placeholder" />
      </a>
      <div className="items-left mt-2">
        <p className="m-2">
          <span className="bg-white text-black p-0.5">Created by</span> {author}
        </p>
        <p className="m-2">
          <span className="bg-white text-black p-0.5">Created on</span> {date}
        </p>
        <p className="m-2">
          <span className="bg-white text-black p-0.5">Completion status</span>{" "}
          {completed ? "Completed" : "In progress"}
        </p>
      </div>
    </div>
  );
}
