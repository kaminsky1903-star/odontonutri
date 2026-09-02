import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Session } from "@supabase/supabase-js";
import { AdminApp } from "./AdminApp";
import { INTERNAL_ANALYTICS_KEY } from "../analytics/types";

const mockSession = {
  access_token: "session-token",
  user: { email: "clinica@example.com" },
} as Session;

const queryResult = vi.hoisted(() => ({
  current: {
    data: [] as Record<string, unknown>[],
    error: null as { message: string } | null,
  },
}));

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
          limit: () => Promise.resolve(queryResult.current),
        }),
      }),
    }),
  }),
}));

describe("admin dashboard session", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    queryResult.current = { data: [], error: null };
  });

  it("shows empty analytics after a restored Supabase session", async () => {
    render(<AdminApp />);

    expect(
      await screen.findByRole("button", { name: "Cerrar sesión" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(INTERNAL_ANALYTICS_KEY)).toBe("1");
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
    expect(screen.getByText(
      "Por defecto ves quiénes entraron hoy. Podés cargar hasta el último mes. Un código identifica al mismo navegador si volvió y la localidad es aproximada. No se guardan nombres ni datos personales.",
    )).toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: /Soy yo/ })).not.toBeInTheDocument();
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

  it("lets the clinic hide their own device from visitors", async () => {
    queryResult.current = {
      data: [
        {
          created_at: new Date().toISOString(),
          event_type: "visit",
          path: "/",
          session_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeffff",
          visitor_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeffff",
          referrer_host: null,
          device_type: "mobile",
          city: "San Miguel",
        },
      ],
      error: null,
    };
    render(<AdminApp />);

    expect(await screen.findByText("Hoy entró 1 visitante.")).toBeInTheDocument();
    expect(screen.getByText("Ubicación aproximada")).toBeInTheDocument();
    expect(screen.getByText("Visitante V-AAAAAAAA")).toBeInTheDocument();
    expect(screen.getByText("San Miguel")).toBeInTheDocument();
    expect(screen.getByText("Fecha y hora")).toBeInTheDocument();
    expect(screen.getByText("Fuente")).toBeInTheDocument();
    expect(screen.getByText("Dispositivo")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Soy yo/ }));
    expect(
      await screen.findByText("Hoy no entró ningún visitante."),
    ).toBeInTheDocument();
  });

  it("keeps one visitor code on the WhatsApp journey line", async () => {
    const visitor = "f95f2a6c-1111-4222-8333-444444444444";
    const sessionId = "7030a8c2-1111-4222-8333-444444444444";
    const start = new Date(Date.now() - 20_000).toISOString();
    queryResult.current = {
      data: [
        {
          created_at: start,
          event_type: "visit",
          path: "/",
          session_id: sessionId,
          visitor_id: visitor,
          referrer_host: null,
          device_type: "desktop",
          city: "Bella Vista",
          region: "Buenos Aires",
          country: "AR",
        },
        {
          created_at: start,
          event_type: "page_view",
          path: "/",
          session_id: sessionId,
          visitor_id: visitor,
          referrer_host: null,
          device_type: "desktop",
          city: "Bella Vista",
          region: "Buenos Aires",
          country: "AR",
        },
        {
          created_at: new Date(Date.now() - 10_000).toISOString(),
          event_type: "page_view",
          path: "/odontologia",
          session_id: sessionId,
          visitor_id: visitor,
          referrer_host: null,
          device_type: "desktop",
          city: "Bella Vista",
          region: "Buenos Aires",
          country: "AR",
        },
        {
          created_at: new Date().toISOString(),
          event_type: "whatsapp_click",
          path: "/odontologia",
          session_id: sessionId,
          visitor_id: visitor,
          referrer_host: null,
          device_type: "desktop",
          city: "Bella Vista",
          region: "Buenos Aires",
          country: "AR",
        },
      ],
      error: null,
    };
    render(<AdminApp />);

    expect(
      await screen.findAllByText("Bella Vista, Buenos Aires", { exact: false }),
    ).toHaveLength(2);
    expect(
      screen.getByText(
        "Visitante V-F95F2A6C · Entró por Inicio · Recorrido: Inicio → Odontología · menos de 1 min en el sitio · 2 páginas · Vio Odontología",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^Visitante V-F95F2A6C/).length).toBe(2);
  });
});
