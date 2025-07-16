import { useState, useEffect } from "react";
import CreateSolverCrossword from "./CreateSolverCrossword";
import SolvedModal from "./SolvedModal";

export default function Solver() {
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showSolvedModal, setShowSolvedModal] = useState<boolean>(false);

  const handleCloseSolvedModal = () => {
    setShowSolvedModal(false);
  };

  useEffect(() => {
    if (showSolvedModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSolvedModal]);

  useEffect(() => {
    if (isSolved) {
      setShowSolvedModal(true);
    }
  }, [isSolved]);

  return (
    <>
      {showSolvedModal && (
        <SolvedModal handleCloseSolvedModal={handleCloseSolvedModal} />
      )}
      <div className="min-h-[80vh] items-center text-center mb-15">
        <CreateSolverCrossword setIsSolved={setIsSolved} />
      </div>
    </>
  );
}
