import LibraryCard from "./LibraryCard";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function Library() {
  const [userData, setUserData] = useState<string[]>([]);
  const [userCards, setUserCards] = useState<React.ReactNode[]>([]);
  const notServer: boolean = true;
  const userid = 1;
  const handleSort = () => {
    userData;
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
      const newUserData: string[] = [];
      const newCards: React.ReactNode[] = [];
      result.forEach((element: any) => {
        let newData: any = {
          username: "Test User",
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
          />
        );
        newCards.push(newCard);
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
          onChange={() => handleSort()}
        >
          <option value="author">Author</option>
          <option value="date">Date: ascending</option>
          <option value="author">Date: descending</option>
          <option value="author">Completion status</option>
        </select>
      </div>
      <section className="flex flex-row gap-5 mb-15 flex-wrap justify-around">
        {userCards}
      </section>
    </div>
  );
}
