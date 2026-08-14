import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/axios";
import type { AuthUser } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithTokens: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return setIsLoading(false);
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.data.user);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const loginWithTokens = (nextUser: AuthUser, accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    setUser(nextUser);
  };

  const updateUser = (nextUser: AuthUser) => setUser(nextUser);

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      await api.post("/auth/logout", { refreshToken });
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithTokens, updateUser, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
