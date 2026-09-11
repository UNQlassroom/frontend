import { Routes, Route, Navigate } from "react-router-dom";
import { HomeProfesor, HomeAlumno } from "@/pages";
import { useRole } from "@/hooks";

export const AppRoutes = () => {
  const { isProfesor } = useRole();

  return (
    <Routes>
      <Route
        path="/home"
        element={isProfesor ? <HomeProfesor /> : <HomeAlumno />}
      />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};
