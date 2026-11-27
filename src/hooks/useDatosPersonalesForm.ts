import { useState, useEffect } from "react";
import { usuarioService } from "@/services";
import { desglosarNombreCompleto } from "@/utils";
import type { Usuario, UsuarioResponseDTO } from "@/types";

export function useDatosPersonalesForm(user: Usuario | null) {
  const initial = desglosarNombreCompleto(user?.nombreCompleto);
  const [nombre, setNombre] = useState(initial.nombre);
  const [apellido, setApellido] = useState(initial.apellido);
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [perfil, setPerfil] = useState<UsuarioResponseDTO | null>(null);
  const [cargando, setCargando] = useState(Boolean(user));

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    usuarioService
      .getUsuarioActual()
      .then((res) => {
        if (!isMounted) return;
        if (res.data) {
          setPerfil(res.data);
          if (res.data.nombreCompleto) {
            const parsed = desglosarNombreCompleto(res.data.nombreCompleto);
            setNombre(parsed.nombre);
            setApellido(parsed.apellido);
          }
          if (res.data.email) setEmail(res.data.email);
          if (res.data.dni) setDni(res.data.dni);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        if (user.nombreCompleto) {
          const parsed = desglosarNombreCompleto(user.nombreCompleto);
          setNombre(parsed.nombre);
          setApellido(parsed.apellido);
        }
      })
      .finally(() => {
        if (isMounted) {
          setCargando(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  return {
    nombre,
    setNombre,
    apellido,
    setApellido,
    email,
    setEmail,
    dni,
    setDni,
    perfil,
    setPerfil,
    cargando,
  };
}
