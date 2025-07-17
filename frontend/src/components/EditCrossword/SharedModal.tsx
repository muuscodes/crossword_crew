import ReactDom from "react-dom";
import type { SharedModalProps } from "../utils/types";

export default function SharedModal(props: SharedModalProps) {
  const { handleCloseSharedModal } = props;
  return ReactDom.createPortal(
    <div className="modal-container-solved">
      <button
        className="modal-underlay-solved"
        onClick={handleCloseSharedModal}
      ></button>
      <div className="modal-content-solved">
        <h2>
          Puzzle <br /> Shared!
        </h2>
      </div>
    </div>,
    document.getElementById("portal")!
  );
}
