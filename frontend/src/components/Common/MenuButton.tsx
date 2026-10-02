import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type MouseEvent, useEffect, useId, useRef, useState } from "react";

export interface MenuItem {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}

// Clicking a menu mustn't take focus away from the crossword grid, so typing carries on after.
const keepFocus = (event: MouseEvent) => event.preventDefault();

// A button that opens a short list of choices above it. Above, so the list never ends up under
// the on-screen keyboard on phones.
export default function MenuButton({ label, items, disabled = false }: { label: string; items: MenuItem[]; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Clicking anywhere else or pressing Escape closes the list.
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="fancyButton bigger"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onMouseDown={keepFocus}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        {label}
        <FontAwesomeIcon icon={faChevronDown} className={`ml-2 text-sm transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          id={menuId}
          aria-label={label}
          className="absolute bottom-full left-1/2 z-30 mb-2 w-44 -translate-x-1/2 border-2 border-black bg-white py-1 text-left shadow-[4px_4px_0_0_#000]"
        >
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                disabled={item.disabled}
                onMouseDown={keepFocus}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className="w-full cursor-pointer px-3 py-2 text-left text-xl hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:bg-transparent"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
