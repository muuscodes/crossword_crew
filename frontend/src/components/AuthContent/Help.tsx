export default function Help() {
  return (
    <>
      <aside>
        <div className="border-10 border-gray-200 w-full p-2">
          <h2 className="text-5xl text-center">Creating a Crossword</h2>
        </div>
        <p className="text-xl text-left p-2">
          For controls, you can use your mouse or keyboard. <br />
          For keyboard navigation: <br />
          <br />
          <span className="help-modal-button">up</span>{" "}
          <span className="help-modal-button">down</span>{" "}
          <span className="help-modal-button">left</span>{" "}
          <span className="help-modal-button">right</span> to move around the
          board
          <br />
          <br />
          <span className="help-modal-button">Tab</span> to the next clue <br />
          <br />
          <span className="help-modal-button text-nowrap">Shift</span> +{" "}
          <span className="help-modal-button text-nowrap">Tab</span> to the
          previous clue <br />
          <br />
          <span className="help-modal-button">Backspace</span> to delete a grid
          value <br />
          <br />
          <span className="help-modal-button">Space</span> to shift between
          across and down <br />
          <br />
          If this is your first time, maybe start with a 5x5 grid to ease your
          way in. For most crosswords, when placing black squares rotational
          symmetry is suggested (and is a requirement for{" "}
          <em>New York Times</em> puzzles, widely considered some of the best in
          the business). On the larger grids, it is recommended to start with
          longer theme clues and work your way down to smaller clues.{" "}
          <em>New York Times</em> also has a rule that clues can't be shorter
          than 3 letters. That rule isn't imposed here so go crazy with grid
          designs! A great{" "}
          <a
            href="https://www.nytimes.com/2018/04/11/crosswords/constructing-themes.html"
            target="_blank"
            className="underline text-blue-600 visited:text-purple-600 hover:text-gray-500 active:text-red-500"
          >
            series
          </a>{" "}
          on constructing crosswords is written by (you guessed it) the{" "}
          <cite>New York Times</cite>. <br />
          <br />
          When writing clues, try to think from your intended solver's
          perspective.{" "}
          <a
            href="https://www.xwordinfo.com/Finder"
            target="_blank"
            className="underline text-blue-600 visited:text-purple-600 hover:text-gray-500 active:text-red-500"
          >
            Xwordinfo
          </a>{" "}
          has a great resource to use when searching for good clues for common
          words. Be sure to include a title, a fully filled out grid, and clues
          before saving your creation! You can always go back to the grid in
          your Library, but keep in mind{" "}
          <em>grids cannot be edited once shared</em>! <br />
          <br />
          Crossword Crew is by no means perfect and I am actively trying to
          improve the site and add new features. I welcome any and all feedback,
          including feature requests and bug reports, which can be reported on
          the Contact page. Additionally, Crossword Crew is an open source
          project so if you want to dip into the code, feel free to check out
          the{" "}
          <a
            href="https://github.com/muuscodes/crossword_crew"
            target="_blank"
            className="underline text-blue-600 visited:text-purple-600 hover:text-gray-500 active:text-red-500"
          >
            repo
          </a>
          .
          <br />
          <br />
          Good luck, cruciverbalist!
        </p>
      </aside>
    </>
  );
}
