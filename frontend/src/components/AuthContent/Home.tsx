import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

export default function Home() {
  const { globalUser } = useAuth();
  const [countData, setCountData] = useState<number[]>([0, 0, 0, 0]);
  const userId = globalUser.user_id;

  async function getUserData() {
    try {
      const response = await fetch(`/users/${userId}/grids/count`, {
        method: "GET",
        credentials: "include",
      });
      const result = await response.json();
      const newCountData: number[] = [0, 0, 0, 0];
      if (response.ok) {
        newCountData[0] = result.totalPuzzleCount;
        newCountData[1] = result.createdByUserCount;
        newCountData[2] = result.createdByOtherCount;
        newCountData[3] = result.solvedPuzzleCount;
      }

      setCountData(newCountData);
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }

  useEffect(() => {
    // const checkSession = async () => {
    //   try {
    //     const response = await fetch("/auth/session", {
    //       method: "GET",
    //       credentials: "include",
    //     });
    //     const sessionData = await response.json();
    //     if (response.ok && sessionData.username && !isAuthenticated) {
    //       const newGlobalUser = {
    //         username: sessionData.username,
    //         user_id: sessionData.user_id,
    //       };
    //       setGlobalUser(newGlobalUser);
    //       setIsAuthenticated(true);
    //     } else {
    //       setIsAuthenticated(false);
    //     }
    //   } catch (error) {
    //     console.error("Error checking session:", error);
    //     setIsAuthenticated(false);
    //   }
    // };

    // checkSession();
    getUserData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center m-autor">
      <h1 className="text-center text-7xl mb-10 mt-5">{`Welcome ${
        globalUser?.username || "Guest"
      }!`}</h1>
      <div className="flex flex-col border-3 w-3/4 h-auto mb-15 justify-between items-center shadow-gray-700 shadow-lg">
        <h2 className="text-center text-4xl p-3 bg-black text-white w-full">
          Puzzling Stats
        </h2>
        <div className="list-none flex lg:grid lg:grid-cols-2 gap-5 flex-col bg-gray-100 justify-around w-full p-10">
          <div className="flex flex-col items-center p-4 border-2 shadow-gray-700 shadow-lg">
            <h2 className="text-2xl text-center p-2 mb-5">
              Number of puzzles in library
            </h2>
            <div className="text-7xl px-6 bg-black text-white font-bold text-center py-4">
              {countData[0]}
            </div>
          </div>
          <div className="flex flex-col items-center p-4 border-2 shadow-gray-700 shadow-lg">
            <h2 className="text-2xl text-center p-2 mb-5">
              Number of puzzles created
            </h2>
            <div className="text-7xl px-6 bg-black text-white font-bold text-center py-4">
              {countData[1]}
            </div>
          </div>
          <div className="flex flex-col items-center p-4 border-2 shadow-gray-700 shadow-lg">
            <h2 className="text-2xl text-center p-2 mb-5">
              Number of puzzles received
            </h2>
            <div className="text-7xl px-6 bg-black text-white font-bold text-center py-4">
              {countData[2]}
            </div>
          </div>
          <div className="flex flex-col items-center p-4 border-2 shadow-gray-700 shadow-lg">
            <h2 className="text-2xl text-center p-2 mb-5">
              Number of puzzles solved
            </h2>
            <div className="text-7xl px-6 bg-black text-white font-bold text-center py-4">
              {countData[3]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
