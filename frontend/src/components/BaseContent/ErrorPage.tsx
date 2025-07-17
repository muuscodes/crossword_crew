import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function ErrorPage() {
  const {
    isAuthenticated,
    setIsAuthenticated,
    setGlobalUser,
    error,
    setError,
  } = useAuth();

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
      }
    } catch (error: any) {
      console.error("Error checking session:", error);
      setIsAuthenticated(false);
      setError(
        error.message ||
          "An unexpected error occurred while checking the session"
      );
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-screen justify-center text-center">
      <h1 className="md:text-6xl text-2xl mt-50 mx-auto">{error}</h1>
      <a
        href={"/"}
        target="_self"
        id={"home"}
        key={"home"}
        aria-label={"home page"}
      >
        <h2 className="md:text-4xl text-xl underline mt-10">Homepage</h2>
      </a>
    </div>
  );
}
