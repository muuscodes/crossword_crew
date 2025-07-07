import { useState, useContext, createContext } from "react";
import type { AuthContextType } from "../components/utils/types";

const defaultAuthContext: AuthContextType = {
  globalUser: { username: "Evan Austin" },
  globalData: "",
  setGlobalUser: () => {},
  setGlobalData: () => {},
  isLoading: false,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  notServer: true,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider(props: any) {
  const { children } = props;
  const [globalUser, setGlobalUser] = useState<any>({
    username: "Evan Austin",
  });
  const [globalData, setGlobalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const notServer: boolean = true;

  const signup = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${notServer ? `http://localhost:3000/auth/signup` : `/auth/signup`}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            username,
            password,
          }),
        }
      );
      if (response.ok) {
        const userData = await response.json();
        setGlobalUser(userData);
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username_email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${notServer ? `http://localhost:3000/auth/login` : `/auth/login`}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username_email,
            password,
          }),
        }
      );
      if (response.ok) {
        const userData = await response.json();
        setGlobalUser(userData);
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // await signOut(auth);
      setGlobalUser(0); // Reset to initial state
      setGlobalData(null); // Reset global data
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    globalUser,
    globalData,
    setGlobalUser,
    setGlobalData,
    isLoading,
    signup,
    login,
    logout,
    notServer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
