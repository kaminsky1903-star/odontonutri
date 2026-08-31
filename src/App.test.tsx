import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import App from "./App";
import {
  GOOGLE_REVIEWS,
  INSTAGRAM_URL,
  NUTRITION_SERVICES,
  SITE_NAME,
  STREET_ADDRESS,
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
    sessionStorage.clear();
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
    ).toHaveAttribute("src", "/nosotros-hero.webp");
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

  it("keeps the analytics panel out of the public navigation", () => {
    render(<App />);

    expect(
      screen.queryByRole("link", { name: /panel de analíticas|admin/i }),
    ).not.toBeInTheDocument();
    expect(
      [...document.querySelectorAll("a")].some(
        (link) => link.getAttribute("href") === "/admin",
      ),
    ).toBe(false);
  });

  it("shows the admin login without public chrome", async () => {
    window.history.replaceState(null, "", "/admin");
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Panel de analíticas" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Cerrar sesión" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Visitantes de hoy")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Principal" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Contactar por WhatsApp" }),
    ).not.toBeInTheDocument();
    expect(document.querySelector(".site-footer")).toBeNull();
    expect(document.querySelector(".map-block")).toBeNull();
  });

  it("shows header navigation without Instagram", async () => {
    const user = userEvent.setup();
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
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Contacto" })).not.toHaveAttribute(
      "aria-current",
    );

    await user.click(screen.getByRole("link", { name: "Contacto" }));
    expect(window.location.hash).toBe("#contacto");
    expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute(
      "aria-current",
    );

    const instagram = screen.getAllByRole("link", { name: /instagram/i });
    expect(instagram.length).toBeGreaterThan(0);
    expect(instagram[0]).toHaveAttribute("href", INSTAGRAM_URL);
    expect(document.querySelector("footer")?.querySelector(`a[href="${INSTAGRAM_URL}"]`)).toBeNull();
  });

  it("keeps the consult CTA out of the header and closes the menu with Escape", async () => {
    const user = userEvent.setup();
    render(<App />);

    const header = document.querySelector("header");
    expect(header).not.toHaveTextContent("Agendá tu consulta");
    expect(
      screen.getByRole("navigation", { name: "Principal" }).querySelectorAll("a"),
    ).toHaveLength(4);

    const toggle = screen.getByRole("button", { name: "Abrir menú" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "site-nav");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();
    expect(header).toHaveClass("is-nav-open");

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Abrir menú" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(header).not.toHaveClass("is-nav-open");

    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "index.css"),
      "utf8",
    );
    expect(css).toMatch(/@media \(width <= 767px\)/);
    expect(css).toMatch(
      /@media \(width <= 767px\)[\s\S]*?header[\s\S]*?position:\s*fixed/,
    );
    expect(css).toMatch(
      /@media \(width <= 767px\)[\s\S]*?\.site-nav[\s\S]*?overflow-y:\s*auto/,
    );
    expect(css).not.toMatch(/html:has\(header\.is-nav-open\)/);
    expect(css).toMatch(/\.nav-arrow\s*\{\s*display:\s*none/);
    expect(css).toMatch(/\.hero-tagline[\s\S]*?color:\s*var\(--muted\)/);
    expect(css).toMatch(/\.hero h1[\s\S]*?11cqi/);
    expect(css).toMatch(
      /@media \(width <= 840px\)[\s\S]*?\.hero-stage[\s\S]*?max-width:\s*none/,
    );
    expect(css).toMatch(/@media \(width > 840px\)[\s\S]*?\.hero-visual/);
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
    expect(photo).toHaveAttribute("src", "/nutricion-hero.webp");
    expect(photo).toHaveAttribute("fetchpriority", "high");

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
    expect(css).toMatch(/\.nutri-hero-photo-clip[\s\S]*?aspect-ratio:\s*1024\s*\/\s*1280/);
    expect(css).toMatch(/\.nutri-hero-title-line[\s\S]*?white-space:\s*nowrap/);
    expect(css).toMatch(/\.nutri-hero h1[\s\S]*?8\.5cqi/);
    expect(css).toMatch(
      /@media \(width <= 840px\)[\s\S]*?\.nutri-hero-stage[\s\S]*?max-width:\s*none/,
    );
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
      expect(screen.getByAltText(service.title)).toHaveAttribute(
        "loading",
        "lazy",
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
    expect(css).toMatch(
      /\.nutri-service-grid[\s\S]*?grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/,
    );
    expect(css).toMatch(
      /@media \(width <= 900px\)[\s\S]*?\.nutri-service-grid[\s\S]*?repeat\(2, minmax\(0, 1fr\)\)/,
    );
    expect(css).toMatch(
      /@media \(width <= 640px\)[\s\S]*?\.nutri-service-grid[\s\S]*?repeat\(2, minmax\(0, 1fr\)\)/,
    );
    expect(screen.getByAltText("Pérdida de peso")).toHaveAttribute(
      "src",
      "/bajar-peso.webp",
    );
  });

  it("places Google reviews between Nutrición services and Visítanos", () => {
    window.history.replaceState(null, "", "/nutricion");
    render(<App />);

    const services = document.getElementById("servicios-nutricion");
    const reviews = document.getElementById("resenas-title");
    const visit = screen.getByRole("heading", { name: "Visítanos" });
    expect(services).toBeTruthy();
    expect(reviews).toBeTruthy();
    expect(
      services!.compareDocumentPosition(reviews!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      reviews!.compareDocumentPosition(visit) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const map = screen.getByRole("region", { name: "Mapa de la clínica" });
    expect(
      visit.compareDocumentPosition(map) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByTitle(`${SITE_NAME} en Google Maps`),
    ).toHaveAttribute("src", expect.stringContaining("maps.google.com/maps"));
    expect(
      screen.getByRole("heading", { name: "Estamos cerca para acompañarte" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Experiencias de pacientes")).toBeInTheDocument();
    expect(screen.getByText("Historias reales.")).toBeInTheDocument();
    expect(screen.getByText("Confianza real.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Historias reales.Confianza real.",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Atención que se/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Reseñas de Google"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Una atención clara, cercana/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /reseñas/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("NUEVO")).not.toBeInTheDocument();
    expect(screen.queryByText("Ver más reseñas")).not.toBeInTheDocument();

    const section = reviews?.closest("section");
    expect(section).toHaveClass("google-reviews");
    expect(section?.querySelectorAll("a")).toHaveLength(0);

    for (const review of GOOGLE_REVIEWS) {
      const photo = screen.getByAltText(review.name);
      expect(photo).toHaveAttribute("src", review.image);
      expect(photo).toHaveAttribute("width", review.featured ? "40" : "32");
      expect(photo).toHaveAttribute("height", review.featured ? "40" : "32");
      expect(photo).toHaveAttribute("loading", "lazy");
      expect(photo).toHaveAttribute("decoding", "async");
      expect(screen.getByText(review.quote)).toBeInTheDocument();
      expect(screen.getByText(review.meta)).toBeInTheDocument();
    }

    const cards = section?.querySelectorAll(".review-card") ?? [];
    expect(cards).toHaveLength(3);
    expect(section?.querySelector("footer")).toBeNull();
    expect(section?.querySelectorAll(".review-author")).toHaveLength(3);
    for (const card of cards) {
      expect(card.querySelectorAll(".review-stars svg")).toHaveLength(5);
    }

    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "index.css"),
      "utf8",
    );
    expect(css).toMatch(/\.google-reviews[\s\S]*?background:\s*var\(--bg\)/);
    expect(css).toMatch(/font-family:\s*"Montserrat"/);
    expect(css).toMatch(/1\.21fr 1\.2fr 1\.21fr/);
    expect(css).toMatch(/\.reviews-cards[\s\S]*?width:\s*83%/);
    expect(css).toMatch(/height:\s*210px/);
    expect(css).toMatch(/height:\s*252px/);
    expect(css).not.toMatch(/translateY\(-28px\)/);
    expect(css).toMatch(/\.review-author[\s\S]*?margin-top:\s*auto/);
    expect(css).toMatch(/\.review-author img[\s\S]*?object-fit:\s*cover/);
    expect(css).toMatch(/\.review-item-featured[\s\S]*?order:\s*-1/);
    expect(css).toMatch(/\.reviews-watermark[\s\S]*?Playfair Display/);
    expect(section?.querySelector(".reviews-watermark")?.textContent?.trim()).toBe(
      "RESEÑAS",
    );
    expect(section?.querySelector(".reviews-watermark")?.textContent).toContain(
      "Ñ",
    );
    expect(section?.querySelector(".reviews-watermark")?.textContent).not.toContain(
      "RESENAS",
    );
  });

  it("keeps Google reviews off the home and Odontología pages", () => {
    render(<App />);
    expect(screen.queryByText("Reseñas de Google")).not.toBeInTheDocument();

    cleanup();
    window.history.replaceState(null, "", "/odontologia");
    render(<App />);
    expect(screen.queryByText("Reseñas de Google")).not.toBeInTheDocument();
  });

  it("renders a focused Odontología landing page with direct contact actions", () => {
    window.history.replaceState(null, "", "/odontologia");
    render(<App />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Volvé a sonreír con confianza.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("IMPLANTES · REHABILITACIÓN · ESTÉTICA"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Tratamientos personalizados para/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Atención particular")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Agendá tu consulta" }),
    ).toHaveAttribute("href", WHATSAPP_PAGE);
    expect(
      screen.getByRole("link", { name: "Ver servicios" }),
    ).toHaveAttribute("href", "#tratamientos-odontologia");
    expect(document.getElementById("tratamientos-odontologia")).toBeTruthy();
    expect(
      screen.getByRole("region", { name: "Volvé a sonreír con confianza." }),
    ).toHaveClass("dentistry-hero", "page-container");
    expect(
      screen.getByAltText(
        "Dr. Kaminsky con una paciente en el sillón odontológico",
      ),
    ).toHaveAttribute("src", "/hero-odonto.webp");
    expect(
      screen.queryByRole("link", { name: "Consultá por WhatsApp" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Llamar al consultorio" }),
    ).not.toBeInTheDocument();

    const band = screen.getByRole("list", { name: "Por qué elegirnos" });
    expect(band).toHaveClass("dentistry-hero-band");
    expect(band.querySelectorAll("li")).toHaveLength(4);
    expect(band).toHaveTextContent("Seguridad y confianza");
    expect(band).toHaveTextContent("Equipo especializado");
    expect(band).toHaveTextContent("Tecnología avanzada");
    expect(band).toHaveTextContent("Atención personalizada");
    expect(band).toHaveTextContent("Protocolos estrictos y materiales certificados.");
    expect(band.querySelectorAll("svg")).toHaveLength(4);

    const stars = document.querySelector(".dentistry-hero-stars");
    expect(stars?.querySelectorAll("svg")).toHaveLength(5);
    expect(stars?.textContent?.replace(/\s/g, "")).toBe("");

    const css = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "index.css"),
      "utf8",
    );
    expect(css).toMatch(
      /url\("\/hero-odonto\.webp"\) 42% center \/ cover no-repeat/,
    );
    expect(css).toMatch(
      /@media \(width <= 840px\)[\s\S]*?aspect-ratio:\s*1042 \/ 941/,
    );
    expect(css).toMatch(
      /\.dentistry-hero[\s\S]*?border-radius:\s*0 0 1\.4rem 1\.4rem/,
    );
    expect(css).toMatch(/\.dentistry-hero h1[\s\S]*?font-family:\s*"Playfair Display"/);
    expect(css).toMatch(/\.dentistry-hero h1[\s\S]*?color:\s*#000/);
    expect(css).toMatch(
      /\.dentistry-hero h1 span:not\(\.dentistry-hero-title-line\)[\s\S]*?color:\s*var\(--process-bg\)/,
    );
    expect(css).toMatch(/#f7f3ec 0%/);
    expect(css).toMatch(/rgba\(247, 243, 236, 0\) 64%/);
    expect(css).toMatch(/scrollbar-gutter:\s*stable/);
    expect(css).toMatch(/aspect-ratio:\s*1120 \/ 717/);
    expect(css).toMatch(
      /@media \(width > 840px\)[\s\S]*?\.dentistry-hero-copy[\s\S]*?scale\(calc\(100cqi \/ 1120px\)\)/,
    );
    expect(css).toMatch(
      /\.dentistry-hero-band[\s\S]*?background:\s*var\(--process-bg\)/,
    );

    for (const service of [
      "Implantes dentales",
      "Prótesis y rehabilitación oral",
      "Tratamiento de conducto",
      "Odontología integral",
    ]) {
      expect(screen.getByRole("heading", { name: service })).toBeInTheDocument();
    }
  });

  it("does not offer a theme switch", () => {
    render(<App />);

    expect(screen.queryByRole("group", { name: "Tema" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Día" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Noche" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Auto" })).toBeNull();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});
