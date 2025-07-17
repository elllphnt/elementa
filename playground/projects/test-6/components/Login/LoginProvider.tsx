import React, { createContext, useContext, useState } from "react";

interface LoginContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const LoginContext = createContext<LoginContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: () => {},
  error: null,
});

export const LoginProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      // Placeholder for actual authentication logic
      // In a real app, this would call an API
      if (email === "demo@example.com" && password === "password123") {
        setIsAuthenticated(true);
        setUser({ email, name: "Demo User" });
        setError(null);
      } else {
        setError("Invalid email or password");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      setError("An error occurred during login");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  return (
    <LoginContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        error,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => useContext(LoginContext);

export default LoginContext;
