import LibraryCard from "./LibraryCard";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

interface UserData {
  username: string;
  puzzle_title: string;
  created_at: string;
  formatted_created_at: string;
  completed_status: boolean;
  grid_id: number;
}

export default function Library() {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [userCards, setUserCards] = useState<React.ReactNode[]>([]);
  const [sortOption, setSortOption] = useState("dateNewest");
  const { globalUser, isAuthenticated, setIsAuthenticated, setGlobalUser } =
    useAuth();
  const globalUserId = globalUser.user_id;

  async function getUserData(userId: number) {
    try {
      const response = await fetch(`/users/${userId}/grids`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      const crossword_grids = data.crossword_grids;
      const solver_grids = data.solver_grids;
      const newUserData: UserData[] = [];
      const newCards: React.ReactNode[] = [];

      if (crossword_grids) {
        crossword_grids.forEach((element: any) => {
          let newData: any = {
            username: element.username,
            puzzle_title: "",
            created_at: element.created_at,
            formatted_created_at: "",
            grid_id: element.grid_id,
          };
          const newTitle = element.puzzle_title;
          if (newTitle === "") {
            newData.puzzle_title = "Crossword Puzzle";
          } else {
            newData.puzzle_title = newTitle;
          }

          const formattedDate = format(
            element.created_at,
            "MMMM d, yyyy 'at' h:mm a"
          );
          newData.formatted_created_at = formattedDate;

          newUserData.push(newData);
          const newCard = (
            <LibraryCard
              author={newData.username}
              name={newData.puzzle_title}
              date={newData.formatted_created_at}
              key={"cw_grid: " + element.grid_id.toString()}
              gridId={element.grid_id}
            />
          );
          newCards.push(newCard);
        });
      }

      if (solver_grids) {
        solver_grids.forEach((element: any) => {
          let newData: any = {
            username: element.creator_username,
            puzzle_title: "",
            created_at: element.created_at,
            formatted_created_at: "",
            completed_status: element.completed_status,
            grid_id: element.grid_id,
          };
          const newTitle = element.puzzle_title;
          if (newTitle === "") {
            newData.puzzle_title = "Crossword Puzzle";
          } else {
            newData.puzzle_title = newTitle;
          }

          const formattedDate = format(
            element.created_at,
            "MMMM d, yyyy 'at' h:mm a"
          );
          newData.formatted_created_at = formattedDate;

          newUserData.push(newData);
          const newCard = (
            <LibraryCard
              author={newData.username}
              name={newData.puzzle_title}
              date={newData.formatted_created_at}
              completed={newData.completed_status}
              key={"solver_grid: " + element.grid_id.toString()}
              gridId={element.grid_id}
            />
          );
          newCards.push(newCard);
        });
      }
      setUserData(newUserData);
      handleSort("dateNewest", newUserData);
    } catch (error) {
      console.error(error);
      throw new Error();
    }
  }

  const handleSort = (
    initial: string,
    userData: UserData[],
    event?: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let selectedOption: string = "";
    if (event) {
      selectedOption = event?.target.value;
    } else {
      selectedOption = initial;
    }

    if (sortOption !== selectedOption) {
      setSortOption(selectedOption);
    }

    const sortedData = [...userData].sort((a, b) => {
      switch (selectedOption) {
        case "author":
          return a.username.localeCompare(b.username);
        case "title":
          return a.puzzle_title.localeCompare(b.puzzle_title);
        case "dateNewest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "dateOldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        default:
          return 0;
      }
    });

    const sortedCards = sortedData.map((data, index) => (
      <LibraryCard
        author={data.username}
        name={data.puzzle_title}
        date={data.formatted_created_at}
        completed={data.completed_status}
        key={index}
        gridId={data.grid_id}
      />
    ));

    setUserCards(sortedCards);
  };

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
        getUserData(newGlobalUser.user_id);
        setGlobalUser(newGlobalUser);
        setIsAuthenticated(true);
      } else if (isAuthenticated) {
        getUserData(globalUserId);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-screen flex flex-col m-auto w-5/6">
      <h1 className="text-center text-7xl mb-10 mt-5">Library</h1>
      <div className="border-1 w-fit mb-5">
        <p className="inline px-2 text-bold border-r-1">Sort by:</p>
        <select
          name="sort-library"
          id="sort-library"
          defaultValue={"dateNewest"}
          onChange={(e) => handleSort("dateNewest", userData, e)}
        >
          <option value="author">Author</option>
          <option value="title">Title</option>
          <option value="dateNewest">Date: newest</option>
          <option value="dateOldest">Date: oldest</option>
        </select>
      </div>
      <section className="flex flex-row gap-5 mb-15 flex-wrap justify-around">
        {userCards}
      </section>
    </div>
  );
}
