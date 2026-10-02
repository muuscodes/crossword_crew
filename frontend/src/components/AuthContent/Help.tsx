import {
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

const Key = ({ children }: { children: ReactNode }) => (
  <kbd className="help-modal-button text-nowrap font-sans">{children}</kbd>
);

const ExternalLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-600 underline visited:text-purple-600 hover:text-gray-500 active:text-red-500"
  >
    {children}
  </a>
);

export default function Help() {
  return (
    <div>
      <div className="flex flex-col items-center gap-3 pb-2">
        <p className="inline-block border-2 border-black bg-cursor px-2.5 py-0.5 text-sm font-bold uppercase tracking-wider shadow-[2px_2px_0_0_#000]">
          How to
        </p>
        <h2 className="text-center text-4xl font-extrabold tracking-tight">Create a crossword</h2>
      </div>
      <div className="flex flex-col gap-4 p-2 text-left text-xl">
        <p>For controls, you can use your mouse or keyboard. For keyboard navigation:</p>
        <ul className="flex flex-col gap-3">
          <li>
            <Key>
              <FontAwesomeIcon icon={faArrowUp} title="Up arrow" />
            </Key>{" "}
            <Key>
              <FontAwesomeIcon icon={faArrowDown} title="Down arrow" />
            </Key>{" "}
            <Key>
              <FontAwesomeIcon icon={faArrowLeft} title="Left arrow" />
            </Key>{" "}
            <Key>
              <FontAwesomeIcon icon={faArrowRight} title="Right arrow" />
            </Key>{" "}
            to move around the board
          </li>
          <li>
            <Key>Tab</Key> to the next clue
          </li>
          <li>
            <Key>Shift</Key> + <Key>Tab</Key> to the previous clue
          </li>
          <li>
            <Key>Backspace</Key> to delete a letter
          </li>
          <li>
            <Key>Space</Key> to switch between across and down
          </li>
          <li>
            <Key>Esc</Key> to leave the grid
          </li>
        </ul>
        <p>
          To place black squares, tick <strong>Set black squares</strong> and click squares to turn
          them black or white. With a keyboard, move with the arrow keys and press <Key>Space</Key>.
        </p>
        <p>
          On a phone or tablet, tap a square to open the crossword keyboard. Tap the same square again,
          or the Across/Down key, to switch direction, and use the arrows above the keys to jump between
          clues.
        </p>
        <p>
          If this is your first time, maybe start with a 5x5 grid to ease your way in. For most
          crosswords, when placing black squares rotational symmetry is suggested (and is a
          requirement for <em>New York Times</em> puzzles, widely considered some of the best in the
          business). On the larger grids, it is recommended to start with longer theme clues and
          work your way down to smaller clues. <em>New York Times</em> also has a rule that clues
          can't be shorter than 3 letters. That rule isn't imposed here so go crazy with grid
          designs! A great{" "}
          <ExternalLink href="https://www.nytimes.com/2018/04/11/crosswords/constructing-themes.html">
            series
          </ExternalLink>{" "}
          on constructing crosswords is written by (you guessed it) the <cite>New York Times</cite>.
        </p>
        <p>
          When writing clues, try to think from your intended solver's perspective.{" "}
          <ExternalLink href="https://www.xwordinfo.com/">Xwordinfo</ExternalLink> has a great
          resource called "Clue and Answer Finder" to use when searching for good clues for common
          words. Be sure to include a title, a fully filled out grid, and clues before saving your
          creation! You can always go back to the grid in your Library, but keep in mind{" "}
          <em>grids cannot be edited once shared</em>!
        </p>
        <p>
          Crossword Crew is by no means perfect and I am actively trying to improve the site and add
          new features. I welcome any and all feedback, including feature requests and bug reports,
          which can be sent through the Feedback page. Additionally, Crossword Crew is an open source
          project so if you want to dip into the code, feel free to check out the{" "}
          <ExternalLink href="https://github.com/muuscodes/crossword_crew">repo</ExternalLink>.
        </p>
        <p>Good luck, cruciverbalist!</p>
      </div>
    </div>
  );
}
