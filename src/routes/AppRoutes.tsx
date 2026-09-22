import { Routes, Route, Navigate, useParams } from "react-router-dom";
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

const RedirectCoursesToCursos = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/cursos/${id}`} replace />;
};

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

      {/* Redirección preventiva para soportar enlaces viejos con /courses */}
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <RedirectCoursesToCursos />
          </ProtectedRoute>
        }
      />

      {/* Redirección por defecto */}
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
