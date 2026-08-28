import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CreateNewAccount, LOgInExistingAccount } from "@/utils/axios";
import type { AxiosError } from "axios";

export function useAuth() {
  // TEMPORARY: force logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false); // skip loading screen
  const [, setLocation] = useLocation();

  // Uncomment this for real auth logic
  /*
  useEffect(() => {
    const authStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(authStatus);
    setIsLoading(false);
  }, []);
  */

  // TEMP LOGIN
  const login = async (data?: { phone: string; name?: string }) => {
    setIsLoggedIn(true); // temporary override
    setLocation("/dashboard");

    // Uncomment below for real API call
    /*
    try {
      const response = await LOgInExistingAccount(data!);
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      setLocation("/dashboard");
      return response;
    } catch (err) {
      const axiosErr = err as AxiosError;
      console.error("Login failed:", axiosErr.response?.data?.message || err);
      throw err;
    }
    */
  };

  const logout = () => {
    setIsLoggedIn(true); // TEMP: prevent logging out
    setLocation("/dashboard"); // stay on dashboard

    // Uncomment below for real logout
    /*
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setLocation("/");
    */
  };

  return { isLoggedIn, isLoading, login, logout };
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // TEMP override: always allow
    // isLoggedIn(true);
    setLocation("/dashboard");

    // Uncomment below for real route protection
    /*
    if (!isLoading && !isLoggedIn) {
      setLocation("/login");
    }
    */
  }, [isLoggedIn, isLoading, setLocation]);

  // Skip loading
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  // Always allow
  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
}