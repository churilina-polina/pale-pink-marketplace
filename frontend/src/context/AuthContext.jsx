import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("marketplace_token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      client.get("/auth/me/").then(({ data }) => setUser(data)).catch(() => {});
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (username, password) => {
    const { data } = await client.post("/auth/login/", { username, password });
    localStorage.setItem("marketplace_token", data.access);
    setToken(data.access);
  };

  const register = async (payload) => {
    await client.post("/auth/register/", payload);
    await login(payload.username, payload.password);
  };

  const logout = () => {
    localStorage.removeItem("marketplace_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isSeller: user?.role === "seller",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
