import HomeCard from "./HomeCard";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center m-autor">
      <h1 className="text-center text-7xl mb-10 mt-5">Welcome user!</h1>
      <HomeCard header={"Puzzling Stats"}>
        <div className="list-none flex md:flex-row flex-col bg-gray-100 justify-around w-full p-10">
          <div className="flex flex-col items-center">
            <h2 className="text-xl p-2 mb-5">Number of puzzles created</h2>
            <div className="text-5xl bg-black text-white font-bold text-center p-4">
              0
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-xl p-2 mb-5">Number of puzzles solved</h2>
            <div className="text-5xl bg-black text-white font-bold text-center p-4">
              0
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-xl p-2 mb-5">Number of puzzles received</h2>
            <div className="text-5xl bg-black text-white font-bold text-center p-4">
              0
            </div>
          </div>
        </div>
      </HomeCard>
      <HomeCard header={"Library"}>
        <div className="list-none flex md:flex-row flex-col bg-gray-100 justify-around w-full p-10">
          <div className="flex flex-col items-center">
            <a
              href="/library"
              target="_self"
              aria-label="Crossword crew library page"
              tabIndex={-1}
            >
              <div className="w-50 h-50 text-5xl bg-black text-white font-bold text-center p-4 mt-5 md:mt-0 hover:scale-105 focus:scale-105 flex items-center">
                Created <br />
                by <br />
                Me
              </div>
            </a>
          </div>
          <div className="flex flex-col items-center">
            <a
              href="/library"
              target="_self"
              aria-label="Crossword crew library page"
              tabIndex={-1}
            >
              <div className="w-50 h-50 text-5xl bg-black text-white font-bold text-center p-4 mt-5 md:mt-0 hover:scale-105 focus:scale-105 flex items-center">
                Created <br />
                by <br />
                Others
              </div>
            </a>
          </div>
        </div>
      </HomeCard>
    </div>
  );
}
