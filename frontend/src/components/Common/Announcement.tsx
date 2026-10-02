import type { ReactNode } from "react";
import Modal from "./Modal";

interface AnnouncementProps {
  label: string;
  onClose: () => void;
  children: ReactNode;
}

// Big "Puzzle saved!" style message.
export default function Announcement({ label, onClose, children }: AnnouncementProps) {
  return (
    <Modal label={label} onClose={onClose} variant="announcement">
      <h2>{children}</h2>
      <button type="button" className="fancyButton bigger self-center" onClick={onClose} data-autofocus>
        OK
      </button>
    </Modal>
  );
}
