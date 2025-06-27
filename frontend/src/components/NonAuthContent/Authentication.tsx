import { useState } from "react";
import googleLogo from "../../img/GoogleLogo.png";

export default function Authentication(props: any) {
  const { handleCloseModal } = props;
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUpToggle = () => {
    setIsSignUp(!isSignUp);
  };

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
        <div className="flex flex-col w-2/3 border-r-3 pr-4">
          {isSignUp && (
            <input
              type="text"
              className="bg-white text-black pl-3 p-0.5 mt-2"
              placeholder="username"
            />
          )}
          <input
            type="text"
            className="bg-white text-black pl-3 p-0.5 mt-2"
            placeholder={isSignUp ? "email" : "username/email"}
          />
          <input
            type="password"
            placeholder={isSignUp ? "password" : "********"}
            className="bg-white text-black pl-3 p-0.5 mt-2"
          />
          <button type="submit" className="text-xl p-2 w-20 mt-4 fancyButton">
            {isSignUp ? "Submit" : "Login"}
          </button>
        </div>
        <a
          href="http://localhost:3000/auth/google"
          target="_self"
          className={`flex flex-col w-1/3 items-center text-center m-l-3 hover:underline ${
            isSignUp ? "mt-7" : ""
          }`}
        >
          <img src={googleLogo} alt="Google Logo" className="w-18" />
          <p>Sign in with Google</p>
        </a>
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
