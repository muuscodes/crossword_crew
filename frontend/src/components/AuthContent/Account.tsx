import { useEffect, useState } from "react";

export default function Account() {
  const [userData, setUserData] = useState<any>("");
  const notServer: boolean = true;

  async function getUserData() {
    try {
      const response = await fetch(
        `${
          notServer
            ? "http://localhost:3000/users/muuscodes"
            : "/users/muuscodes"
        }`
      );
      const freshData = await response.json();
      let newData: any = {
        username: "",
        email: "",
        password: "",
      };
      freshData.forEach((element: any) => {
        newData.username = element.username;
        newData.email = element.email;
        newData.password = element.password;
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
    <div className="min-h-[80vh] items-center">
      <h1 className="text-center text-7xl mb-10 mt-5">Account</h1>
      <table className="account-table shadow-2xl">
        <tbody>
          <tr>
            <th>Username</th>
            <td>{userData.username}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{userData.email}</td>
          </tr>
          <tr>
            <th>Password</th>
            <td>{userData.password}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
