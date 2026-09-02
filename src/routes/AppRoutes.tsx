import { Routes, Route, Navigate } from "react-router-dom";
import { HomeProfesor } from "@/pages";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/home" element={<HomeProfesor />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};
