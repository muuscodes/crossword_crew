import ReactDom from "react-dom";

export default function HelpModal(props: any) {
  const { children, handleCloseHelpModal } = props;
  return ReactDom.createPortal(
    <div className="modal-container-help">
      <button
        className="modal-underlay-help"
        onClick={handleCloseHelpModal}
      ></button>
      <div className="modal-content-help">{children}</div>
    </div>,
    document.getElementById("portal")!
  );
}
