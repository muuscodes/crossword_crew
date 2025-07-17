import ReactDom from "react-dom";
import type { ModalProps } from "../utils/types";

export default function Modal(props: ModalProps) {
  const { children, handleCloseModal } = props;
  return ReactDom.createPortal(
    <div className="modal-container">
      <button className="modal-underlay" onClick={handleCloseModal}></button>
      <div className="modal-content">{children}</div>
    </div>,
    document.getElementById("portal")!
  );
}
