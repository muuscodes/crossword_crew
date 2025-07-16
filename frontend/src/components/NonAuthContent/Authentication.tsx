import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import googleLogo from "../../img/GoogleLogo.png";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function Authentication(props: any) {
  const { handleCloseModal } = props;
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { signup, login, setGlobalUser, isLoading } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSignUpToggle = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const email = isSignUp ? (formData.get("email") as string) : "";
    const password = formData.get("password") as string;

    try {
      if (isSignUp) {
        await signup(email, username, password);
      } else {
        await login(username, password);
      }
      handleCloseModal();
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/auth/google";
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/auth/google/user", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();

          const newGlobalUser = {
            username: userData.username,
            user_id: userData.user_id,
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
    if (window.location.pathname === "/home") {
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
      {errorMessage && (
        <div className="text-red-500 text-center mt-2">{errorMessage}</div>
      )}
      <div className="flex flex-row w-full">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-2/3 border-r-3 pr-4"
        >
          <input
            type="text"
            name="username"
            className="bg-white text-black pl-3 p-0.5 mt-2"
            placeholder="username"
            required
          />

          {isSignUp && (
            <input
              type="text"
              name="email"
              className="bg-white text-black pl-3 p-0.5 mt-2"
              placeholder="email"
              required
            />
          )}
          <div className="flex flex-row w-full">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={isSignUp ? "password" : "********"}
              className="bg-white text-black pl-3 p-0.5 mt-2 w-7/8"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className=" text-white w-1/8 pt-1.5"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>

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
      {isLoading && <p className="text-2xl text-center">Loading...</p>}
    </>
  );
}
