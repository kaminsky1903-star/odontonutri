import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";
import {
  INSTAGRAM_URL,
  NUTRITION_SERVICES,
  SITE_NAME,
  STREET_ADDRESS,
  THEME_KEY,
  WHATSAPP_NUTRITION_MESSAGE,
  WHATSAPP_NUTRITION_PAGE,
  WHATSAPP_PAGE,
  WHATSAPP_URL,
  whatsappPageWithMessage,
} from "./site";

describe("App", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    window.history.replaceState(null, "", "/");
  });

  it("renders the clinic name, address, and specialty actions", () => {
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
    expect(
      screen.getAllByRole("link", { name: "Odontología" }).some(
        (link) => link.getAttribute("href") === "/odontologia",
      ),
    ).toBe(true);
    expect(
      screen.getAllByRole("link", { name: "Nutrición" }).some(
        (link) => link.getAttribute("href") === "/nutricion",
      ),
    ).toBe(true);
    expect(
      screen.getByAltText("Dr. Kaminsky y Lic. González"),
    ).toBeInTheDocument();
  });

  it("shows the patient process between the hero photo and visit card", () => {
    render(<App />);

    const process = screen.getByRole("heading", {
      name: /Una atención clara/,
    });
    const visit = screen.getByRole("heading", { name: "Visítanos" });
    const photo = screen.getByAltText("Dr. Kaminsky y Lic. González");

    expect(process.compareDocumentPosition(visit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(photo.compareDocumentPosition(process) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("Consulta y diagnóstico")).toBeInTheDocument();
    expect(screen.getByText("Plan personalizado")).toBeInTheDocument();
    expect(screen.getByText("Tratamiento")).toBeInTheDocument();
    expect(screen.getByText("Seguimiento y controles")).toBeInTheDocument();
  });

  it("keeps WhatsApp out of the header and uses a floating control", () => {
    render(<App />);

    expect(
      screen.queryByRole("link", { name: "Sacar turno" }),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector("header")?.querySelector(`a[href="${WHATSAPP_URL}"]`),
    ).toBeNull();
    expect(
      document.querySelector("header")?.querySelector(`a[href="${WHATSAPP_PAGE}"]`),
    ).toBeNull();

    const floating = screen.getByRole("link", {
      name: "Contactar por WhatsApp",
    });
    expect(floating).toHaveAttribute("href", WHATSAPP_PAGE);
    expect(floating).toHaveAttribute("target", "_blank");
    expect(floating).toHaveAttribute("rel", "noopener noreferrer");
    expect(floating).toHaveAttribute("title", "Contactar por WhatsApp");
    expect(floating).toHaveClass("whatsapp-float");
    expect(floating.querySelector("svg")).toBeTruthy();
    expect(floating.textContent?.replace(/\s+/g, "")).toBe("");

    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "index.css"),
      "utf8",
    );
    expect(css).not.toMatch(/\.whatsapp-float\s*\{\s*display:\s*none/);
  });

  it("shows header navigation without Instagram", () => {
    render(<App />);

    const header = document.querySelector("header");
    expect(header).toBeTruthy();
    expect(header?.querySelector(`a[href="${INSTAGRAM_URL}"]`)).toBeNull();
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute(
      "href",
      "#contacto",
    );
    expect(document.getElementById("contacto")).toHaveTextContent("Visítanos");
    expect(screen.getByRole("navigation", { name: "Principal" })).toBeTruthy();

    const instagram = screen.getAllByRole("link", { name: /instagram/i });
    expect(instagram.length).toBeGreaterThan(0);
    expect(instagram[0]).toHaveAttribute("href", INSTAGRAM_URL);
    expect(document.querySelector("footer")?.querySelector(`a[href="${INSTAGRAM_URL}"]`)).toBeNull();
  });

  it("exposes WhatsApp and map actions", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      WHATSAPP_PAGE,
    );
    expect(
      screen.getByRole("link", { name: "Sacá tu turno por WhatsApp" }),
    ).toHaveAttribute("href", WHATSAPP_PAGE);
    expect(screen.getByRole("link", { name: "Google Maps" })).toHaveAttribute(
      "href",
      expect.stringContaining("google.com/maps"),
    );
    expect(screen.getByRole("link", { name: "Apple Maps" })).toHaveAttribute(
      "href",
      expect.stringContaining("maps.apple.com"),
    );
  });

  it("omits the Nutrición specialty intro copy", () => {
    window.history.replaceState(null, "", "/nutricion");
    render(<App />);

    expect(screen.queryByText("NUTRICIÓN")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 1, name: "Nutrición" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Nutrición clínica y deportiva/),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Visítanos" })).toBeInTheDocument();
  });

  it("renders the Nutrición hero with the local photo and WhatsApp handoff", () => {
    window.history.replaceState(null, "", "/nutricion");
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Comé mejor.Viví más saludable.",
    );
    expect(screen.getByText("más saludable.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Orientación nutricional personalizada, adaptada a tus necesidades, hábitos y objetivos.",
      ),
    ).toBeInTheDocument();

    const photo = screen.getByAltText("Orientación nutricional personalizada");
    expect(photo).toHaveAttribute("src", "/nutricion-hero.png");

    expect(
      screen.getByRole("link", { name: "Agendá tu consulta" }),
    ).toHaveAttribute("href", WHATSAPP_NUTRITION_PAGE);
    expect(WHATSAPP_NUTRITION_PAGE).toContain(
      encodeURIComponent(WHATSAPP_NUTRITION_MESSAGE),
    );
    expect(
      screen.getByRole("link", { name: "Ver servicios" }),
    ).toHaveAttribute("href", "#servicios-nutricion");
    expect(document.getElementById("servicios-nutricion")).toBeTruthy();
    expect(screen.getByText("Calorías diarias")).toBeInTheDocument();
    expect(screen.getByText("1,620 kcal")).toBeInTheDocument();
    expect(screen.getByText("Progreso del objetivo")).toBeInTheDocument();
    expect(screen.getByText("6/8 vasos")).toBeInTheDocument();
    expect(screen.getByText("Alimentación práctica")).toBeInTheDocument();

    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "index.css"),
      "utf8",
    );
    expect(css).toMatch(/\.nutri-hero-photo[\s\S]*?object-fit:\s*contain/);
    expect(css).toMatch(/\.nutri-hero-title-line[\s\S]*?white-space:\s*nowrap/);
  });

  it("renders the Nutrición services section with WhatsApp handoff", () => {
    window.history.replaceState(null, "", "/nutricion");
    render(<App />);

    const section = document.getElementById("servicios-nutricion");
    expect(section?.tagName).toBe("H2");
    expect(section).toHaveClass("nutri-services-title");
    expect(section?.closest("section")).toHaveClass("nutri-services");
    expect(
      screen.getByRole("heading", { name: "Nutrición pensada para vos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("para vos")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Acompañamiento personalizado para cuidar tu salud y alcanzar tus objetivos.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Servicios de nutrición" }),
    ).toBeInTheDocument();

    for (const service of NUTRITION_SERVICES) {
      expect(screen.getByAltText(service.title)).toHaveAttribute(
        "src",
        service.image,
      );
      expect(
        screen.getByRole("link", {
          name: `Consultar ${service.title} por WhatsApp`,
        }),
      ).toHaveAttribute("href", whatsappPageWithMessage(service.message));
    }

    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "index.css"),
      "utf8",
    );
    expect(css).toMatch(/\.nutri-service-visual img[\s\S]*?object-fit:\s*contain/);
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
