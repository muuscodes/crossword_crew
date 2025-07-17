import { useState, useEffect } from "react";
import CreateCrossword from "../BuildCrossword/CreateCrossword";
import HelpModal from "./HelpModal";
import Help from "./Help";
import { useAuth } from "../../context/AuthContext";
import SavedModal from "./SavedModal";
// import { useNavigate } from "react-router-dom";

export default function Create() {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const { setGlobalUser, isAuthenticated, setIsAuthenticated, setError } =
    useAuth();
  // const navigate = useNavigate();

  const handleCloseHelpModal = () => {
    setShowHelpModal(false);
  };

  const handleCloseSavedModal = () => {
    setShowSavedModal(false);
    setIsSaved(false);
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
          setError(sessionData.message || "Session check failed");
          // navigate("/errorpage");
          return;
        }
      } catch (error: any) {
        console.error("Error checking session:", error);
        setIsAuthenticated(false);
        setError(
          error.message ||
            "An unexpected error occurred while checking the session"
        );
        // navigate("/errorpage");
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
      {showSavedModal && (
        <SavedModal handleCloseSavedModal={handleCloseSavedModal} />
      )}
      <div className="min-h-[80vh] text-center mb-15 relative">
        <button
          className="absolute right-0 text-4xl mr-7 w-10 h-fit border-2 px-0.5 rounded-[100%] bg-black text-white font-bold mt-1 hover:scale-110 cursor-pointer"
          onClick={() => setShowHelpModal(true)}
        >
          ?
        </button>
        <h1 className="text-center text-7xl my-5">Create</h1>
        <p className={`text-2xl m-auto mb-3 h-fit text-red-600`}>
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
