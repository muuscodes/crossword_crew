import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function NoPage() {
  const { setIsAuthenticated, setGlobalUser } = useAuth();

  const checkSession = async () => {
    try {
      const response = await fetch("/auth/session", {
        method: "GET",
        credentials: "include",
      });
      const sessionData = await response.json();

      if (response.ok) {
        if (sessionData.username) {
          const newGlobalUser = {
            username: sessionData.username,
            user_id: sessionData.user_id,
          };
          setGlobalUser(newGlobalUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        throw new Error("Unauthorized access");
      }
    } catch (error: any) {
      console.error("Error checking session:", error);
      setIsAuthenticated(false);
      alert(error.message);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-screen justify-center text-center">
      <h1 className="md:text-6xl text-2xl mt-50 mx-auto">Page not found!</h1>
      <a
        href={"/"}
        target="_self"
        id={"home"}
        key={"home"}
        aria-label={"home" + " page"}
      >
        <h2 className="md:text-4xl text-xl underline mt-10">Homepage</h2>
      </a>
    </div>
  );
}
