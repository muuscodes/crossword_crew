import { useState, useEffect } from "react";
import CreateCrossword from "../BuildCrossword/CreateCrossword";
import HelpModal from "./HelpModal";
import Help from "./Help";
import { useAuth } from "../../context/AuthContext";

export default function Create() {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const { setGlobalUser, isAuthenticated, setIsAuthenticated } = useAuth();

  const handleCloseHelpModal = () => {
    setShowHelpModal(false);
  };

  useEffect(() => {
    if (showHelpModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showHelpModal]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/auth/session", {
          method: "GET",
          credentials: "include",
        });
        const sessionData = await response.json();
        if (response.ok && sessionData.username && !isAuthenticated) {
          const newGlobalUser = {
            username: sessionData.username,
            user_id: sessionData.user_id,
          };
          setGlobalUser(newGlobalUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
      }
    };

    checkSession();
  }, []);

  return (
    <>
      {showHelpModal && (
        <HelpModal handleCloseHelpModal={handleCloseHelpModal}>
          <Help></Help>
        </HelpModal>
      )}
      <div className="min-h-[80vh] text-center mb-15 relative">
        <button
          className="absolute right-0 text-4xl mr-7 w-10 h-fit border-2 px-0.5 rounded-[100%] bg-black text-white font-bold mt-1 hover:scale-110 cursor-pointer"
          onClick={() => setShowHelpModal(true)}
        >
          ?
        </button>
        <h1 className="text-center text-7xl my-5">Create</h1>
        <p className="text-xl m-auto mb-3 h-fit text-red-600">
          {isSaved ? `Puzzle Saved!` : ""}
          {userMessage ? userMessage : ""}
        </p>
        <CreateCrossword
          setIsSaved={setIsSaved}
          setUserMessage={setUserMessage}
        />
      </div>
    </>
  );
}
