import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  PHONE_LABEL,
  PHONE_TEL,
  SITE_NAME,
  STREET_ADDRESS,
  THEME_KEY,
  WHATSAPP_URL,
} from "./site";

describe("App", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("renders the clinic name, address, and services", () => {
    render(<App />);

    expect(
      screen.getAllByText(SITE_NAME).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      SITE_NAME,
    );
    expect(document.querySelector("address")).toHaveTextContent(
      STREET_ADDRESS,
    );
    expect(screen.getByText("Odontología")).toBeInTheDocument();
    expect(screen.getByText("Nutrición")).toBeInTheDocument();
    expect(screen.getByText(/Dr\. Kaminsky/)).toBeInTheDocument();
    expect(screen.getByText(/Lic\. González/)).toBeInTheDocument();
  });

  it("links the header call button to the clinic phone", () => {
    render(<App />);

    expect(
      screen.getByRole("link", { name: `Llamar ${PHONE_LABEL}` }),
    ).toHaveAttribute("href", `tel:${PHONE_TEL}`);
  });

  it("keeps Instagram out of the header and available in the page", () => {
    render(<App />);

    const header = document.querySelector("header");
    expect(header).toBeTruthy();
    expect(header?.querySelector(`a[href="${INSTAGRAM_URL}"]`)).toBeNull();

    const instagram = screen.getAllByRole("link", { name: /instagram/i });
    expect(instagram.length).toBeGreaterThan(0);
    expect(instagram[0]).toHaveAttribute("href", INSTAGRAM_URL);
    expect(screen.getByRole("link", { name: INSTAGRAM_HANDLE })).toHaveAttribute(
      "href",
      INSTAGRAM_URL,
    );
  });

  it("exposes WhatsApp and map actions", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      WHATSAPP_URL,
    );
    expect(screen.getByRole("link", { name: "Google Maps" })).toHaveAttribute(
      "href",
      expect.stringContaining("google.com/maps"),
    );
    expect(screen.getByRole("link", { name: "Apple Maps" })).toHaveAttribute(
      "href",
      expect.stringContaining("maps.apple.com"),
    );
  });

  it("persists the selected theme", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Noche" }));

    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: "Noche" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
