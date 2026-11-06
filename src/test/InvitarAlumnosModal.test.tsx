import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { InvitarAlumnosModal } from "@/components/curso/InvitarAlumnosModal";
import { apiClient } from "@/api";
import { toast } from "react-toastify";
import type { CursoResponseDTO } from "@/types";

vi.mock("react-toastify", () => ({
  toast: {
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

describe("InvitarAlumnosModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockAdapter = vi.fn();

  const mockCurso: CursoResponseDTO = {
    id: 10,
    materia: "Construcción de Software",
    anio: 2026,
    semestre: 1,
    comision: 1,
    ownerUsername: "docente",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.defaults.adapter = mockAdapter;
  });

  test("Caso válido: envío exitoso -> feedback visual -> actualización de lista", async () => {
    // Arrange
    mockAdapter.mockResolvedValueOnce({
      data: {
        cursoId: 10,
        alumnos: [{ username: "octocat", role: "member", state: "pending" }],
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    });

    render(
      <InvitarAlumnosModal
        open={true}
        onClose={mockOnClose}
        curso={mockCurso}
        onSuccess={mockOnSuccess}
      />
    );

    const inputUsername = screen.getByTestId("username-input");
    const botonSubmit = screen.getByTestId("submit-button");

    // Act
    await userEvent.type(inputUsername, "octocat{enter}");
    await userEvent.click(botonSubmit);

    // Assert
    await waitFor(() => {
      expect(mockAdapter).toHaveBeenCalledTimes(1);
      expect(mockAdapter).toHaveBeenCalledWith(
        expect.objectContaining({
          url: "/cursos/10/alumnos",
          method: "post",
          data: JSON.stringify({ usernames: ["octocat"] }),
        })
      );
    });

    const divSuccess = await screen.findByTestId("success-feedback");
    expect(divSuccess).toHaveTextContent("¡Invitaciones enviadas!");
    expect(divSuccess).toHaveTextContent(
      "Se agregaron 1 alumno(s) al curso."
    );
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });

  test("Caso inválido: validación de formato erróneo sin llamada a la API", async () => {
    // Arrange
    render(
      <InvitarAlumnosModal
        open={true}
        onClose={mockOnClose}
        curso={mockCurso}
        onSuccess={mockOnSuccess}
      />
    );

    const inputUsername = screen.getByTestId("username-input");
    const botonSubmit = screen.getByTestId("submit-button");

    // Act
    await userEvent.type(inputUsername, "usuario invalido!{enter}");
    await userEvent.click(botonSubmit);

    // Assert
    const divError = screen.getByTestId("error-message");
    expect(divError).toHaveTextContent(
      "El formato del usuario de GitHub no es válido."
    );
    expect(mockAdapter).not.toHaveBeenCalled();
  });

  test("Caso alumno duplicado: manejo de error y notificación toast clara", async () => {
    // Arrange
    const backendMessage =
      "Los siguientes alumnos ya están inscriptos en el curso: juanperez";

    mockAdapter.mockRejectedValueOnce(
      new AxiosError(
        "Request failed with status code 409",
        "ERR_BAD_REQUEST",
        {} as InternalAxiosRequestConfig,
        {},
        {
          status: 409,
          statusText: "Conflict",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
          data: {
            errorCode: "ALUMNO_DUPLICADO",
            message: backendMessage,
          },
        }
      )
    );

    render(
      <InvitarAlumnosModal
        open={true}
        onClose={mockOnClose}
        curso={mockCurso}
        onSuccess={mockOnSuccess}
      />
    );

    const inputUsername = screen.getByTestId("username-input");
    const botonSubmit = screen.getByTestId("submit-button");

    // Act
    await userEvent.type(inputUsername, "juanperez{enter}");
    await userEvent.click(botonSubmit);

    // Assert
    const divError = await screen.findByTestId("error-message");
    expect(divError).toHaveTextContent(backendMessage);
    expect(toast.warning).toHaveBeenCalledWith(
      backendMessage,
      expect.objectContaining({
        toastId: "api_err_ALUMNO_DUPLICADO",
      })
    );
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test("Caso usuario GitHub inexistente: manejo de error de API y feedback al usuario", async () => {
    // Arrange
    const backendMessage =
      "Los siguientes usuarios no existen en GitHub: usuario-inexistente";

    mockAdapter.mockRejectedValueOnce(
      new AxiosError(
        "Request failed with status code 400",
        "ERR_BAD_REQUEST",
        {} as InternalAxiosRequestConfig,
        {},
        {
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config: {} as InternalAxiosRequestConfig,
          data: {
            errorCode: "GITHUB_USERS_NOT_FOUND",
            message: backendMessage,
          },
        }
      )
    );

    render(
      <InvitarAlumnosModal
        open={true}
        onClose={mockOnClose}
        curso={mockCurso}
        onSuccess={mockOnSuccess}
      />
    );

    const inputUsername = screen.getByTestId("username-input");
    const botonSubmit = screen.getByTestId("submit-button");

    // Act
    await userEvent.type(inputUsername, "usuario-inexistente");
    await userEvent.click(botonSubmit);

    // Assert
    const divError = await screen.findByTestId("error-message");
    expect(divError).toHaveTextContent(backendMessage);
    expect(toast.warning).toHaveBeenCalledWith(
      backendMessage,
      expect.objectContaining({
        toastId: "api_err_GITHUB_USERS_NOT_FOUND",
      })
    );
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
