import { useState, useEffect } from "react";
import CreateSolverCrossword from "./CreateSolverCrossword";
import SavedModal from "../AuthContent/SavedModal";
import SolvedModal from "./SolvedModal";

export default function Solver() {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [showSolvedModal, setShowSolvedModal] = useState<boolean>(false);

  const handleCloseSavedModal = () => {
    setShowSavedModal(false);
    setIsSaved(false);
  };
  const handleCloseSolvedModal = () => {
    setShowSolvedModal(false);
    setIsSolved(false);
  };

  useEffect(() => {
    if (showSavedModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSavedModal]);

  useEffect(() => {
    if (isSaved) {
      setShowSavedModal(true);
    }
  }, [isSaved]);

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
      {showSavedModal && (
        <SavedModal handleCloseSavedModal={handleCloseSavedModal} />
      )}
      {showSolvedModal && (
        <SolvedModal handleCloseSolvedModal={handleCloseSolvedModal} />
      )}
      <div className="min-h-[80vh] items-center text-center mb-15">
        <p className="text-2xl m-auto mb-3 h-fit"></p>
        <CreateSolverCrossword
          setIsSaved={setIsSaved}
          setIsSolved={setIsSolved}
        />
      </div>
    </>
  );
}
