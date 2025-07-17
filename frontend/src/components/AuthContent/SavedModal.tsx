import ReactDom from "react-dom";
import type { SavedModalProps } from "../utils/types";

export default function SavedModal(props: SavedModalProps) {
  const { handleCloseSavedModal } = props;
  return ReactDom.createPortal(
    <div className="modal-container-solved">
      <button
        className="modal-underlay-solved"
        onClick={handleCloseSavedModal}
      ></button>
      <div className="modal-content-solved">
        <h2>
          Puzzle <br /> Saved!
        </h2>
      </div>
    </div>,
    document.getElementById("portal")!
  );
}
