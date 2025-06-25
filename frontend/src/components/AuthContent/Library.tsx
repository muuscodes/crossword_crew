import LibraryCard from "./LibraryCard";
import { useState, useEffect } from "react";

export default function Library() {
  const [userData, setUserData] = useState<any>("");
  const userid = 1;
  // const handleSort = () => {
  //   // filter
  // };

  async function getUserData() {
    try {
      const response = await fetch(`/users/grids/${userid}`);
      const freshData = await response.json();
      let newData: any = {
        username: "Test User",
        time_created: "",
        completed_status: "",
      };
      freshData.forEach((element: any) => {
        newData.time_created = element.time_created;
        newData.completed_status = element.completed_status;
      });
      setUserData(newData);
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
        <select name="sort-library" id="sort-library">
          <option value="author">Author</option>
          <option value="date">Date created ascending</option>
          <option value="author">Date created descending</option>
          <option value="author">Completion</option>
        </select>
      </div>
      <section className="flex flex-row gap-5 mb-15 flex-wrap justify-around">
        <LibraryCard
          author={"Evan Austin"}
          date={userData.time_created}
          completed={userData.completed_status}
        />
        {/* <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        />
        <LibraryCard
          author={"Evan Austin"}
          date={"February 10, 1999"}
          completed={false}
        /> */}
      </section>
    </div>
  );
}
