import ReactDom from "react-dom";

export default function SolvedModal(props: any) {
  const { handleCloseSolvedModal } = props;
  return ReactDom.createPortal(
    <div className="modal-container-solved">
      <button
        className="modal-underlay-solved"
        onClick={handleCloseSolvedModal}
      ></button>
      <div className="modal-content-solved">
        <h2>
          Puzzle <br /> Solved!
        </h2>
      </div>
    </div>,
    document.getElementById("portal")!
  );
}
