import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { AdminApp } from "./AdminApp";

const mockSession = {
  access_token: "session-token",
  user: { email: "clinica@example.com" },
} as Session;

vi.mock("./supabaseClient", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseClient: () => ({
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: mockSession }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(async () => ({ error: null })),
    },
    from: () => ({
      select: () => ({
        gte: () => ({
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  }),
}));

describe("admin dashboard session", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows empty analytics after a restored Supabase session", async () => {
    render(<AdminApp />);

    expect(
      await screen.findByRole("button", { name: "Cerrar sesión" }),
    ).toBeInTheDocument();
    expect(screen.getByText("clinica@example.com")).toBeInTheDocument();
    expect(screen.getByText("Visitantes de hoy")).toBeInTheDocument();
    expect(
      screen.queryByText("Visitantes de los últimos 7 días"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Visitantes de los últimos 30 días"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "WhatsApp" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Visitantes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hoy" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Cargar últimos 7 días" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cargar último mes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Fuentes de tráfico")).toBeInTheDocument();
    expect(screen.getByText("Conversiones por página")).toBeInTheDocument();
    expect(screen.getByText("Horario de WhatsApp")).toBeInTheDocument();
    expect(screen.queryByText("Actividad reciente")).not.toBeInTheDocument();
    expect(
      await screen.findByText("Visitas y clics del sitio, últimos 30 días."),
    ).toBeInTheDocument();
    expect(screen.getByText("Hoy no entró ningún visitante.")).toBeInTheDocument();
    expect(screen.getAllByText("Todavía no hay datos.").length).toBeGreaterThan(
      0,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Cargar últimos 7 días" }));
    expect(
      screen.getByText("En los últimos 7 días entraron 0 visitantes."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cargar último mes" }));
    expect(
      screen.getByText("En el último mes entraron 0 visitantes."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Contactar por WhatsApp" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeEnabled();
  });
});
