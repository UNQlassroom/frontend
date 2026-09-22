import { Routes, Route, Navigate } from "react-router-dom";
import { HomeProfesor, HomeAlumno, LoginPage, OAuthCallbackPage } from "@/pages";
import { useAuth } from "@/hooks";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRoutes = () => {
  const { isProfesor, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route
        path="/home"
        element={
          <ProtectedRoute>
            {isProfesor ? <HomeProfesor /> : <HomeAlumno />}
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
