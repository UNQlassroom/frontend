import { useState, type ReactNode } from "react";
import { AuthContext } from "./auth.context";
import { STORAGE_KEYS } from "@/constants";
import type { Usuario } from "@/types";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  });

  const [user, setUser] = useState<Usuario | null>(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as Usuario;
    } catch {
      localStorage.removeItem(STORAGE_KEYS.USER);
      return null;
    }
  });

  const login = (newToken: string, newUser: Usuario) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.OAUTH_ES_DOCENTE);
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
