import { useState, useContext, createContext } from "react";
import type { AuthContextType } from "../components/utils/types";
import type { globalUserType } from "../components/utils/types";

const defaultAuthContext: AuthContextType = {
  globalUser: {
    username: "",
    userId: -1,
  },
  setGlobalUser: () => {},
  isLoading: false,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider(props: any) {
  const { children } = props;
  const [globalUser, setGlobalUser] = useState<globalUserType>({
    username: "",
    userId: -1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const notServer: boolean = false;

  const getUserId = async (username: string) => {
    try {
      const response = await fetch(`/users/${username}`);
      const freshData = await response.json();
      let newUser: any = {
        username: username,
        userId: freshData.userid,
      };
      setGlobalUser(newUser);
    } catch (error) {
      console.log("Server error:", error);
    }
  };

  const signup = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      });
      if (response.ok) {
        const userData = await response.json();
        const newGlobalUser = {
          username: userData.username,
          userId: userData.userid,
        };
        setGlobalUser(newGlobalUser);
        getUserId(userData.username);
        await login(username, password);
      }
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: "include",
      });
      if (response.ok) {
        const userData = await response.json();
        const newGlobalUser = {
          username: userData.username,
          userId: userData.userid,
        };
        setGlobalUser(newGlobalUser);
        getUserId(userData.username);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch(`/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      setGlobalUser({ username: "", userId: -1 }); // Reset to initial state
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    globalUser,
    setGlobalUser,
    isLoading,
    signup,
    login,
    logout,
    notServer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
