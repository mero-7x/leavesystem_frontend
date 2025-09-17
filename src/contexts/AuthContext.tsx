"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { User } from "../types";
import { api } from "../services/api"; // your axios instance
import { setAuthToken } from "../services/api"; // export this from services/api

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  initialized: boolean; // 👈 NEW
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // hydrate from storage on first mount
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setAuthToken(storedToken); // 👈 puts Authorization header on axios defaults
    } else {
      setAuthToken(null);
    }
    setInitialized(true);
  }, []);

  // keep axios header in sync even if token changes later
  useEffect(() => {
    if (!initialized) return;
    setAuthToken(token);
  }, [token, initialized]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setAuthToken(newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: Boolean(token && user),
      initialized, // 👈 expose
    }),
    [user, token, initialized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
