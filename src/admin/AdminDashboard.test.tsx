import { cleanup, render, screen } from "@testing-library/react";
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
    expect(screen.getByText("Fuentes de tráfico")).toBeInTheDocument();
    expect(screen.getByText("Actividad reciente")).toBeInTheDocument();
    expect(
      await screen.findByText("Visitas y clics del sitio, últimos 30 días."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Todavía no hay datos.").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.queryByRole("link", { name: "Contactar por WhatsApp" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeEnabled();
  });
});
