import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Contact() {
  const {
    isAuthenticated,
    setIsAuthenticated,
    setGlobalUser,
    fetchWithAuth,
    setError,
  } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    message: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await fetchWithAuth("/email/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      alert("Email sent successfully!");
      setFormData({ username: "", email: "", message: "" });
    } catch (error) {
      console.error("Error:", error);
      alert("Error sending email. Please try again later.");
    }
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
        setGlobalUser(newGlobalUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setError(sessionData.message || "Session check failed");
        navigate("/errorpage");
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

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <div className="min-h-[83vh] flex flex-col items-center m-auto">
      <h1 className="text-center text-7xl my-5">Contact</h1>
      <form
        className="flex flex-col border-4 shadow-2xl h-100 w-2/3"
        onSubmit={handleSubmit}
      >
        <label htmlFor="username" className="m-1 text-2xl">
          Name
        </label>
        <input
          type="text"
          name="username"
          id="username"
          value={formData.username}
          onChange={(e) => handleChange(e)}
          className="border-1 m-2 text-2xl pl-0.5"
        />
        <label htmlFor="email" className="m-1 text-2xl">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange(e)}
          className="border-1 m-2 text-2xl pl-0.5"
        />
        <label htmlFor="message" className="m-1 text-2xl">
          Message
        </label>
        <textarea
          name="message"
          id="message"
          value={formData.message}
          onChange={(e) => handleChange(e)}
          className="border-1 h-full m-2 text-2xl pl-0.5"
          style={{ resize: "none" }}
        ></textarea>
        <button className="fancyButton bigger m-2">Submit</button>
      </form>
    </div>
  );
}
