import { Routes, Route, Navigate, useParams } from "react-router-dom";
import { HomeProfesor, HomeAlumno, CursoDetalle } from "@/pages";
import { useRole } from "@/hooks";

const RedirectCursosToCourses = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/courses/${id}`} replace />;
};

export const AppRoutes = () => {
  const { isProfesor } = useRole();

  return (
    <Routes>
      <Route
        path="/home"
        element={isProfesor ? <HomeProfesor /> : <HomeAlumno />}
      />
      <Route path="/courses/:id" element={<CursoDetalle />} />
      <Route path="/cursos/:id" element={<RedirectCursosToCourses />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
};

