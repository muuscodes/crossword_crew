import LibraryCard from "./LibraryCard";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface UserData {
  username: string;
  puzzle_title: string;
  time_created: string;
  formatted_time_created: string;
  completed_status: boolean;
  grid_id: number;
}

export default function Library() {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [userCards, setUserCards] = useState<React.ReactNode[]>([]);
  const [sortOption, setSortOption] = useState("author");
  const userid = 1;
  const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value;
    if (sortOption !== selectedOption) {
      setSortOption(selectedOption);
    }
    console.log(selectedOption);

    const sortedData = [...userData].sort((a, b) => {
      switch (selectedOption) {
        case "author":
          return a.username.localeCompare(b.username);
        case "title":
          return a.puzzle_title.localeCompare(b.puzzle_title);
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
        date={data.formatted_time_created}
        completed={data.completed_status}
        key={index}
        gridId={data.grid_id}
      />
    ));

    setUserCards(sortedCards);
    console.log(sortedCards);
  };

  async function getUserData() {
    try {
      const response = await fetch(`/users/${userid}/grids`);
      const result = await response.json();
      const newUserData: UserData[] = [];
      const newCards: React.ReactNode[] = [];

      console.log(result);

      result.forEach((element: any) => {
        let newData: any = {
          username: element.username,
          puzzle_title: "",
          time_created: element.time_created,
          formatted_time_created: "",
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
          element.time_created,
          "MMMM d, yyyy 'at' h:mm a"
        );
        newData.formatted_time_created = formattedDate;

        newUserData.push(newData);
        const newCard = (
          <LibraryCard
            author={newData.username}
            name={newData.puzzle_title}
            date={newData.formatted_time_created}
            completed={newData.completed_status}
            key={element.grid_id}
            gridId={element.grid_id}
          />
        );
        newCards.push(newCard);
      });
      setUserData(newUserData);
      setUserCards(newCards);
    } catch (error) {
      throw new Error();
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
          <option value="title">Title</option>
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
