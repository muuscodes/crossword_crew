import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import googleLogo from "../../img/GoogleLogo.png";
import { useNavigate } from "react-router-dom";

export default function Authentication(props: any) {
  const { handleCloseModal } = props;
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  // const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { signup, login, setGlobalUser } = useAuth();

  const handleSignUpToggle = () => {
    setIsSignUp(!isSignUp);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const username = isSignUp ? (formData.get("username") as string) : "";
    const password = formData.get("password") as string;

    try {
      if (isSignUp) {
        await signup(email, username, password);
      } else {
        await login(email, password);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/auth/google";
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("here");
        const response = await fetch("/auth/google/redirect");
        if (response.ok) {
          console.log("Not here");

          const userData = await response.json();
          console.log(userData);
          const newGlobalUser = {
            username: userData.username,
            userId: userData.userid,
          };
          setGlobalUser(newGlobalUser);
          navigate("/home");
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Call fetchUserData if the user is redirected back
    if (window.location.pathname === "/auth/google/redirect") {
      fetchUserData();
    }
  }, [setGlobalUser, navigate]);

  return (
    <>
      <div className="flex flex-row-reverse justify-between">
        <button
          className="text-right text-3xl hover:opacity-50 hover:scale-130 cursor-pointer"
          onClick={handleCloseModal}
        >
          X
        </button>
        <h2 className="text-5xl text-left ">
          {isSignUp ? "Sign up" : "Login"}
        </h2>
      </div>
      <p className="text-xl">
        {isSignUp ? "Create an account" : "Sign into your account"}
      </p>
      <div className="flex flex-row w-full">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-2/3 border-r-3 pr-4"
        >
          {isSignUp && (
            <input
              type="text"
              name="username"
              className="bg-white text-black pl-3 p-0.5 mt-2"
              placeholder="username"
              required
            />
          )}
          <input
            type="text"
            name="email"
            className="bg-white text-black pl-3 p-0.5 mt-2"
            placeholder={isSignUp ? "email" : "username"}
            required
          />
          <input
            type="password"
            name="password"
            placeholder={isSignUp ? "password" : "********"}
            className="bg-white text-black pl-3 p-0.5 mt-2"
            required
          />
          <button type="submit" className="text-xl p-2 w-20 mt-4 fancyButton">
            {isSignUp ? "Submit" : "Login"}
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className={`flex flex-col w-1/3 items-center text-center m-l-3 hover:underline cursor-pointer ${
            isSignUp ? "mt-7" : ""
          }`}
        >
          <img src={googleLogo} alt="Google Logo" className="w-18" />
          <p>Sign in with Google</p>
        </button>
      </div>
      <hr className="text-white" />
      <div className="flex flex-col items-center">
        <p className={`text-2xl ${isSignUp ? "" : "mt-5"} `}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
        </p>
        <button onClick={handleSignUpToggle} className="fancyButton text-2xl">
          {isSignUp ? "Login" : "Sign up"}
        </button>
      </div>
    </>
  );
}
