import { Routes, Route, Navigate } from "react-router-dom";
import {
  HomeDocente,
  HomeAlumno,
  CursoDetalleDocente,
  CursoDetalleAlumno,
  LoginPage,
  OAuthCallbackPage,
} from "@/pages";
import { useAuth } from "@/hooks";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRoutes = () => {
  const { isDocente, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rutas Públicas de Autenticación */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

      {/* Rutas Protegidas (requieren sesión activa) */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            {isDocente ? <HomeDocente /> : <HomeAlumno />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/cursos/:id"
        element={
          <ProtectedRoute>
            {isDocente ? <CursoDetalleDocente /> : <CursoDetalleAlumno />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
      />
    </Routes>
  );
};
