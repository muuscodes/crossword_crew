import { useState, useContext, createContext } from "react";
import type { AuthContextType } from "../components/utils/types";
import type { globalUserType } from "../components/utils/types";
// import { useNavigate } from "react-router-dom";

const defaultAuthContext: AuthContextType = {
  globalUser: {
    username: "",
    user_id: -1,
  },
  setGlobalUser: () => {},
  isLoading: false,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  librarySortSetting: "dateNewest",
  setLibrarySortSetting: () => {},
  handleGoogleRedirect: async () => {},
  getToken: () => "",
  fetchWithAuth: async (
    url: string,
    options?: RequestInit
  ): Promise<Response> => {
    return fetch(url, options);
  },
  error: "",
  setError: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider(props: any) {
  const { children } = props;
  const [globalUser, setGlobalUser] = useState<globalUserType>({
    username: "",
    user_id: -1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [librarySortSetting, setLibrarySortSetting] =
    useState<string>("dateNewest");
  const [error, setError] = useState<string>("");
  // const navigate = useNavigate();

  const getUserId = async (username: string) => {
    try {
      const response = await fetch(`/users/${username}`, {
        method: "GET",
        credentials: "include",
      });
      const freshData = await response.json();
      if (response.ok) {
        let newUser: any = {
          username: username,
          user_id: freshData.user_id,
        };
        setGlobalUser(newUser);
      } else {
        setError(freshData.message || "An error occurred while fetching data.");
        // navigate("/errorpage");
        return;
      }
    } catch (error: any) {
      setError(error.message || "An unexpected error occurred");
      // navigate("/errorpage");
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      await login(username, password);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/auth/login`, {
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      const userData = await response.json();
      const newGlobalUser = {
        username: userData.user.username,
        user_id: userData.user.user_id,
      };
      setGlobalUser(newGlobalUser);
      getUserId(userData.user.username);
      setIsAuthenticated(true);

      localStorage.setItem("token", userData.token);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetchWithAuth(`/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      setGlobalUser({ username: "", user_id: -1 });
      setIsAuthenticated(false);
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRedirect = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/auth/google/user`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      const newGlobalUser = {
        username: userData.user.username,
        user_id: userData.user.user_id,
      };
      setGlobalUser(newGlobalUser);
      getUserId(userData.user.username);
      setIsAuthenticated(true);

      localStorage.setItem("token", userData.token);
    } catch (error) {
      console.error("Google redirect error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    const response = fetch(url, {
      ...options,
      headers,
    });

    return response;
  };

  const value = {
    globalUser,
    setGlobalUser,
    isLoading,
    signup,
    login,
    logout,
    isAuthenticated,
    setIsAuthenticated,
    librarySortSetting,
    setLibrarySortSetting,
    handleGoogleRedirect,
    getToken,
    fetchWithAuth,
    error,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
