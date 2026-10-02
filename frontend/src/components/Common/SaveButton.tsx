import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SaveButtonProps {
  // True when there are changes that haven't been saved.
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  label?: string;
  disabled?: boolean;
}

// Reads "Saved", looks different and can't be pressed until there's something new to save, so the
// same work is never saved twice.
export default function SaveButton({ dirty, saving, onSave, label = "Save", disabled = false }: SaveButtonProps) {
  if (!dirty && !saving) {
    return (
      <button type="button" className="fancyButton bigger saved" disabled>
        <FontAwesomeIcon icon={faCheck} className="mr-2" />
        Saved
      </button>
    );
  }
  return (
    <button type="button" className="fancyButton bigger" onClick={onSave} disabled={saving || disabled}>
      {saving ? "Saving…" : label}
    </button>
  );
}
