/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import LoginScreen from "./components/LoginScreen";
import DashboardScreen from "./components/DashboardScreen";
import { SapUser } from "./types";

export default function App() {
  const [currentUser, setCurrentUser] = useState<SapUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("tandempro_theme") as "dark" | "light") || "dark";
  });

  // Load and restore session from storage on app load
  useEffect(() => {
    const savedSession = sessionStorage.getItem("tandempro_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("Error restoring session:", e);
      }
    }
    setIsInitializing(false);
  }, []);

  // Update theme setting in localStorage
  useEffect(() => {
    localStorage.setItem("tandempro_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleLoginSuccess = (user: SapUser) => {
    setCurrentUser(user);
    sessionStorage.setItem("tandempro_session", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("tandempro_session");
  };

  if (isInitializing) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-mono text-xs transition-colors duration-150 ${theme === "dark" ? "bg-slate-950 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Iniciando TandemPRO Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentUser ? (
        <DashboardScreen user={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} theme={theme} toggleTheme={toggleTheme} />
      )}
    </>
  );
}

