import { useState, useEffect } from "react";
import CreateEditorCrossword from "./CreateEditorCrossword";
import SavedModal from "../AuthContent/SavedModal.tsx";
import SharedModal from "./SharedModal.tsx";

export default function Editor() {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isShared, setIsShared] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [showSharedModal, setShowSharedModal] = useState<boolean>(false);

  const handleCloseSavedModal = () => {
    setShowSavedModal(false);
    setIsSaved(false);
  };
  const handleCloseSharedModal = () => {
    setShowSharedModal(false);
    setIsShared(false);
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
    if (showSharedModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSharedModal]);

  useEffect(() => {
    if (isShared) {
      setShowSharedModal(true);
    }
  }, [isShared]);

  return (
    <>
      {showSavedModal && (
        <SavedModal handleCloseSavedModal={handleCloseSavedModal} />
      )}
      {showSharedModal && (
        <SharedModal handleCloseSharedModal={handleCloseSharedModal} />
      )}
      <div className="min-h-[80vh] items-center text-center mb-15">
        <h1 className="text-center text-7xl my-5">Edit</h1>
        <p className="text-xl m-auto mb-3 h-fit text-red-600">
          {userMessage ? userMessage : ""}
        </p>
        <CreateEditorCrossword
          setIsSaved={setIsSaved}
          setIsShared={setIsShared}
          setUserMessage={setUserMessage}
        />
      </div>
    </>
  );
}
