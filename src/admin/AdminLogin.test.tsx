import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminApp } from "./AdminApp";

const signInWithPassword = vi.fn(async () => ({
  data: { session: null, user: null },
  error: { status: 400, message: "Invalid login credentials" },
}));

vi.mock("./supabaseClient", () => ({
  isSupabaseConfigured: () => true,
  getSupabaseClient: () => ({
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword,
      signOut: vi.fn(),
    },
  }),
}));

describe("admin login with Supabase configured", () => {
  afterEach(() => {
    cleanup();
    signInWithPassword.mockClear();
  });

  it("keeps the dashboard closed until a real session exists", async () => {
    const user = userEvent.setup();
    render(<AdminApp />);

    const submit = await screen.findByRole("button", { name: "Ingresar" });
    expect(submit).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: "Cerrar sesión" }),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Email"), "clinica@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "clave-incorrecta");
    await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("type", "text");
    await user.click(submit);

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "clinica@example.com",
      password: "clave-incorrecta",
    });
    expect(
      await screen.findByText("Email o contraseña incorrectos."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Visitantes de hoy")).not.toBeInTheDocument();
  });
});
