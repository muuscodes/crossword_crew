import { useState } from "react";

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
          className="text-right text-3xl hover:opacity-60"
          onClick={handleCloseModal}
        >
          X
        </button>
        <h2 className="text-4xl text-left ">
          {isSignUp ? "Sign up" : "Login"}
        </h2>
      </div>
      <p>{isSignUp ? "Create an account" : "Sign into your account"}</p>
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
      <button type="submit" className="text-xl p-2 w-20 mt-4 authButton">
        {isSignUp ? "Submit" : "Login"}
      </button>
      <hr className="text-white" />
      <p>{isSignUp ? "Already have an account?" : "Don't have an account?"}</p>
      <button
        onClick={handleSignUpToggle}
        className="text-xl p-2 w-30 authButton"
      >
        {isSignUp ? "Login" : "Sign up"}
      </button>
    </>
  );
}
