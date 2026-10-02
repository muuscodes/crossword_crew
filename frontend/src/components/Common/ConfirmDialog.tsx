import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal label={title} onClose={onCancel} variant="light">
      <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
      <p className="text-xl">{message}</p>
      <div className="flex justify-center gap-6">
        <button type="button" className="fancyButton bigger" onClick={onCancel} data-autofocus>
          Cancel
        </button>
        <button type="button" className="fancyButton bigger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
