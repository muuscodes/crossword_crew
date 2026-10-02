import { type ReactNode, useEffect, useEffectEvent, useRef } from "react";
import { createPortal } from "react-dom";

type ModalVariant = "form" | "light" | "announcement";

// Class names from App.css for each look.
const VARIANT_CLASSES: Record<ModalVariant, { container: string; underlay: string; content: string }> = {
  form: { container: "modal-container", underlay: "modal-underlay", content: "modal-content" },
  light: {
    container: "modal-container-help",
    underlay: "modal-underlay-help",
    content: "modal-content-help",
  },
  announcement: {
    container: "modal-container-solved",
    underlay: "modal-underlay-solved",
    content: "modal-content-solved",
  },
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  label: string;
  onClose: () => void;
  variant?: ModalVariant;
  children: ReactNode;
}

// Accessible dialog: focus moves into it (to the element marked data-autofocus, if any), Tab
// stays inside, Escape or a click outside closes it, the page behind can't scroll, and focus
// returns to whatever opened it.
export default function Modal({ label, onClose, variant = "form", children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const classes = VARIANT_CLASSES[variant];

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "Tab" && dialogRef.current) {
      keepFocusInside(event, dialogRef.current);
    }
  });

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    (dialog?.querySelector<HTMLElement>("[data-autofocus]") ?? dialog)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
      document.body.style.overflow = previousOverflow;
      opener?.focus();
    };
  }, []);

  return createPortal(
    <div className={classes.container}>
      <button
        type="button"
        className={classes.underlay}
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`${classes.content} outline-none`}
      >
        {children}
      </div>
    </div>,
    document.getElementById("portal") ?? document.body,
  );
}

function keepFocusInside(event: KeyboardEvent, dialog: HTMLElement) {
  const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
  if (focusable.length === 0) {
    event.preventDefault();
    dialog.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === dialog)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
