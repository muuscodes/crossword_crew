import { useState } from "react";

export default function Authentication(props: any) {
  const { handleCloseModal } = props;
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUpToggle = () => {
    setIsSignUp(!isSignUp);
  };

  const generateRandomToken = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const token = Array.from(array, (byte) =>
      ("0" + byte.toString(16)).slice(-2)
    ).join("");
    return token;
  };

  // the client id from GCP
  const client_id =
    "151423192531-776ea11i20ef617fclnr2mvi8ucvrsgb.apps.googleusercontent.com";

  // create a CSRF token and store it locally
  const state = generateRandomToken();
  localStorage.setItem("latestCSRFToken", state);

  // redirect the user to Google
  const link = `https://accounts.google.com/o/oauth2/auth?scope=https://www.googleapis.com/auth/cloud-platform&response_type=code&access_type=offline&state=${state}&redirect_uri=https://localhost:5173/oauth2/callback&client_id=${client_id}`;
  window.location.assign(link);

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
      <button type="submit" className="text-xl p-2 w-20 mt-4 fancyButton">
        {isSignUp ? "Submit" : "Login"}
      </button>
      <hr className="text-white" />
      <p>{isSignUp ? "Already have an account?" : "Don't have an account?"}</p>
      <button
        onClick={handleSignUpToggle}
        className="text-xl p-2 w-30 fancyButton"
      >
        {isSignUp ? "Login" : "Sign up"}
      </button>
    </>
  );
}
