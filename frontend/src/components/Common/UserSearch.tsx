import { type KeyboardEvent, type Ref, useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";

const SEARCH_DELAY_MS = 200;

interface UserSearchProps {
  id: string;
  value: string;
  onChange: (username: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

// A text box with a dropdown of usernames from the server. Typing narrows the list; Up, Down and
// Enter or a click pick a name. A typed name can also be submitted as is.
export default function UserSearch({ id, value, onChange, autoFocus, disabled, className = "", ref }: UserSearchProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ query: string; usernames: string[] } | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const query = value.trim();
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-option-${index}`;

  // Search shortly after typing stops, while the dropdown is open.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      apiRequest<{ users: string[] }>(`/users/search?q=${encodeURIComponent(query)}`)
        .then(({ users }) => {
          if (cancelled) return;
          setResults({ query, usernames: users });
          setActiveIndex(-1);
        })
        .catch(() => {
          if (!cancelled) setResults({ query, usernames: [] });
        });
    }, SEARCH_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query]);

  const usernames = results?.usernames ?? [];
  const searching = results?.query !== query;

  const choose = (username: string) => {
    onChange(username);
    setOpen(false);
    setActiveIndex(-1);
  };

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setOpen(true);
        setActiveIndex((index) => Math.min(index + 1, usernames.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
        // With a highlighted name, Enter picks it; otherwise it submits the form as usual.
        if (open && usernames[activeIndex]) {
          event.preventDefault();
          choose(usernames[activeIndex]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
    }
  }

  return (
    <div className={`relative ${className}`}>
      <input
        ref={ref}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        maxLength={50}
        placeholder="Search usernames"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        className="w-full border-2 border-black bg-white px-3 py-2 text-lg outline-none transition placeholder:text-neutral-400 focus:bg-yellow-50 focus:shadow-tile disabled:opacity-60"
      />
      {open &&
        (usernames.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            aria-label="Usernames"
            className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto border-2 border-black bg-white text-left text-xl shadow-lg"
          >
            {usernames.map((username, index) => (
              <li
                key={username}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                className={`cursor-pointer px-2 py-1 ${index === activeIndex ? "bg-blue-200" : "hover:bg-gray-100"}`}
                // mousedown, not click: picking a name must happen before the input's blur closes the list.
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(username);
                }}
              >
                {username}
              </li>
            ))}
          </ul>
        ) : (
          <div
            id={listId}
            role="status"
            className="absolute left-0 right-0 z-20 mt-1 border-2 border-black bg-white px-2 py-1 text-left text-xl text-gray-600 shadow-lg"
          >
            {searching ? "Searching…" : "No matching users"}
          </div>
        ))}
    </div>
  );
}
