import { useState, type ReactNode } from "react";
import { AuthContext } from "./auth.context";
import type { Usuario } from "@/types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<Usuario | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as Usuario;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  });

  const login = (newToken: string, newUser: Usuario) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem("oauth_es_docente");
  };

  const isAuthenticated = Boolean(token && user);
  const isDocente = Boolean(user?.esDocente);
  const isAlumno = Boolean(user && !user.esDocente);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading: false,
        isDocente,
        isAlumno,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
