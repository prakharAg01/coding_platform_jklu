import { createContext, StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('authState');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
});

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = getStoredAuth();
    return stored?.isAuthenticated || false;
  });
  const [user, setUser] = useState(() => {
    const stored = getStoredAuth();
    return stored?.user || null;
  });

  useEffect(() => {
    localStorage.setItem('authState', JSON.stringify({ isAuthenticated, user }));
  }, [isAuthenticated, user]);

  return (
    <Context.Provider
      value={{ isAuthenticated, setIsAuthenticated, user, setUser }}
    >
      <App />
    </Context.Provider>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
