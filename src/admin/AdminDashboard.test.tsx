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
        gte: () => ({ lte() { return this; }, order() { return this; },
          range: () => Promise.resolve(queryResult.current),
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
    expect(screen.getByText("Visitantes únicos")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/");
    expect(await screen.findByText("0 visitantes · 0 sesiones · 0 contactos únicos")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "WhatsApp" })).toBeInTheDocument();
    for (const name of ["Fuentes de tráfico", "Campañas", "Páginas de entrada", "Clics de contacto por página", "Tipo de dispositivo", "Localidades", "Horario de WhatsApp", "Visitantes"]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Hoy" }));
    expect(await screen.findByText("Sin actividad en este período.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Personalizado" }));
    expect(screen.getByLabelText("Desde")).toBeInTheDocument();
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

    expect(await screen.findByText("1 visitantes · 1 sesiones · 0 contactos únicos")).toBeInTheDocument();
    expect(screen.getByText("Ubicación aproximada")).toBeInTheDocument();
    expect(screen.getByText("Visitante V-AAAAAAAA")).toBeInTheDocument();
    expect(screen.getAllByText("San Miguel")).toHaveLength(2);
    expect(screen.getByText("Fecha y hora")).toBeInTheDocument();
    expect(screen.getByText("Fuente")).toBeInTheDocument();
    expect(screen.getByText("Dispositivo")).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /Soy yo/ }));
    expect(
      await screen.findByText("0 visitantes · 0 sesiones · 0 contactos únicos"),
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
    ).toHaveLength(3);
    expect(
      screen.getByText(
        "Visitante V-F95F2A6C · Entró por Inicio · Recorrido: Inicio → Odontología · menos de 1 min hasta el clic (tiempo transcurrido) · 2 páginas · Vio Odontología",
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^Visitante V-F95F2A6C/).length).toBe(2);
  });
});
