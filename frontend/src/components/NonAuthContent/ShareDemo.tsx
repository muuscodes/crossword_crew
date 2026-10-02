import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FIELD = "mt-1 flex items-center border-2 border-black bg-white px-2 py-1 text-xl";

// A picture of the Send a puzzle form mid-search, with the confirmation stuck on top. It's an
// illustration, so screen readers get one description instead of controls that don't work.
export default function ShareDemo() {
  return (
    <figure
      role="img"
      aria-label="Sending the puzzle Heart of the Matter: typing bo in the username search lists bob, bobby and bonnie, and the puzzle is shared with bob."
      className="relative w-full max-w-md text-left"
    >
      <div className="border-3 border-black bg-white shadow-[6px_6px_0_0_#000]">
        <p className="bg-black px-4 py-3 text-center text-2xl font-bold text-white">Send a puzzle</p>
        <div className="flex flex-col gap-4 bg-gray-100 p-5">
          <div>
            <p className="text-lg">Puzzle</p>
            <p className={`${FIELD} justify-between`}>
              Heart of the Matter
              <FontAwesomeIcon icon={faChevronDown} className="text-base" />
            </p>
          </div>
          <div>
            <p className="text-lg">Send to</p>
            <p className={FIELD}>
              bo
              <span className="caret-blink ml-px inline-block h-6 w-0.5 bg-black" />
            </p>
            <ul className="mt-1 border-2 border-black bg-white text-xl shadow-lg">
              <li className="bg-blue-200 px-2 py-1">bob</li>
              <li className="px-2 py-1">bobby</li>
              <li className="px-2 py-1">bonnie</li>
            </ul>
          </div>
          <p className="fancyButton bigger pointer-events-none self-center">Send</p>
        </div>
      </div>
      <p className="absolute -right-2 -top-6 rotate-6 border-3 border-black bg-yellow-200 px-4 py-2 text-xl font-extrabold shadow-[4px_4px_0_0_#000] sm:-right-8">
        Shared with bob!
      </p>
    </figure>
  );
}
