import LibraryCard from "./LibraryCard";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

interface UserData {
  username: string;
  puzzle_title: string;
  time_created: string;
  completed_status: boolean;
  grid_id: number;
}

export default function Library() {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [userCards, setUserCards] = useState<React.ReactNode[]>([]);
  const [sortOption, setSortOption] = useState("author");
  const notServer = useAuth();
  const userid = 1;
  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value;
    if (sortOption !== selectedOption) {
      setSortOption(selectedOption);
    }
    const sortedData = [...userData].sort((a, b) => {
      switch (selectedOption) {
        case "author":
          return a.username.localeCompare(b.username);
        case "dateNewest":
          return (
            new Date(b.time_created).getTime() -
            new Date(a.time_created).getTime()
          );
        case "dateOldest":
          return (
            new Date(a.time_created).getTime() -
            new Date(b.time_created).getTime()
          );
        case "completionStatus":
          return a.completed_status === b.completed_status
            ? 0
            : a.completed_status
            ? 1
            : -1;
        default:
          return 0;
      }
    });

    const sortedCards = sortedData.map((data, index) => (
      <LibraryCard
        author={data.username}
        name={data.puzzle_title}
        date={data.time_created}
        completed={data.completed_status}
        key={index}
        gridId={data.grid_id}
      />
    ));

    setUserCards(sortedCards);
  };

  async function getUserData() {
    try {
      const response = await fetch(
        `${
          notServer
            ? `http://localhost:3000/users/${userid}/grids`
            : `/users/${userid}/grids`
        }`
      );
      const result = await response.json();
      const newUserData: UserData[] = [];
      const newCards: React.ReactNode[] = [];
      result.forEach((element: any) => {
        let newData: any = {
          username: "Evan Austin",
          time_created: "",
          completed_status: "",
        };

        newData.completed_status = element.completed_status;
        newData.puzzle_title = element.puzzle_title;
        if (newData.puzzle_title === "") {
          newData.puzzle_title = "Crossword Puzzle";
        }

        const date = element.time_created;
        const formattedDate = format(date, "MMMM d, yyyy 'at' h:mm a");
        newData.time_created = formattedDate;
        newUserData.push(newData);
        const newCard = (
          <LibraryCard
            author={"Evan Austin"}
            name={newData.puzzle_title}
            date={newData.time_created}
            completed={newData.completed_status}
            key={element.grid_id}
            gridId={element.grid_id}
          />
        );
        newCards.push(newCard);
        console.log(element.grid_id);
      });
      setUserData(newUserData);
      setUserCards(newCards);
    } catch (error) {
      console.log("Server error:", error);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col m-auto w-5/6">
      <h1 className="text-center text-7xl mb-10 mt-5">Library</h1>
      <div className="border-1 w-fit mb-5">
        <p className="inline px-2 text-bold border-r-1">Sort by:</p>
        <select
          name="sort-library"
          id="sort-library"
          onChange={(e) => handleSort(e)}
        >
          <option value="author">Author</option>
          <option value="dateNewest">Date: newest</option>
          <option value="dateOldest">Date: oldest</option>
          <option value="completionStatus">Completion status</option>
        </select>
      </div>
      <section className="flex flex-row gap-5 mb-15 flex-wrap justify-around">
        {userCards}
      </section>
    </div>
  );
}
