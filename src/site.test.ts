import { describe, expect, it } from "vitest";
import {
  ADMIN_PATH,
  GOOGLE_REVIEWS,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  CLINIC_TIME_ZONE,
  DENTISTRY_ADVANCED_TREATMENTS,
  DENTISTRY_COMMON_TREATMENTS,
  DENTISTRY_FEATURED_TREATMENT,
  NUTRITION_SERVICES,
  PHONE_LABEL,
  PHONE_TEL,
  SITE_NAME,
  SITE_URL,
  STREET_ADDRESS,
  DENTISTRY_SERVICES_LEAD,
  WHATSAPP_NUTRITION_MESSAGE,
  WHATSAPP_NUTRITION_PAGE,
  WHATSAPP_PAGE,
  WHATSAPP_URL,
  whatsappPageWithMessage,
} from "./site";

describe("site constants", () => {
  it("uses the public clinic identity", () => {
    expect(SITE_NAME).toBe("Odontología y Nutrición");
    expect(SITE_URL).toBe("https://www.odontonutri.com/");
    expect(CLINIC_TIME_ZONE).toBe("America/Argentina/Buenos_Aires");
    expect(STREET_ADDRESS).toBe("Av. Senador Morón 858");
    expect(DENTISTRY_SERVICES_LEAD).toBe(
      "Atención odontológica personalizada para recuperar salud, función y estética.",
    );
  });

  it("exposes reachable contact channels", () => {
    expect(PHONE_TEL).toBe("+541161370040");
    expect(PHONE_LABEL).toBe("11 6137 0040");
    expect(INSTAGRAM_HANDLE).toBe("@odontologia.nutricion");
    expect(INSTAGRAM_URL).toBe(
      "https://www.instagram.com/odontologia.nutricion/",
    );
    expect(WHATSAPP_PAGE).toBe("/whatsapp.html");
    expect(ADMIN_PATH).toBe("/admin");
    expect(WHATSAPP_URL).toMatch(/^https:\/\/wa\.link\//);
    expect(WHATSAPP_NUTRITION_MESSAGE).toBe(
      "Hola, quisiera agendar una consulta de nutrición.",
    );
    expect(WHATSAPP_NUTRITION_PAGE).toBe(
      `${WHATSAPP_PAGE}?text=${encodeURIComponent(WHATSAPP_NUTRITION_MESSAGE)}`,
    );
    expect(whatsappPageWithMessage("Hola, prueba")).toBe(
      `${WHATSAPP_PAGE}?text=${encodeURIComponent("Hola, prueba")}`,
    );
    expect(DENTISTRY_FEATURED_TREATMENT.image).toBe("/implante-odonto.webp");
    expect(DENTISTRY_ADVANCED_TREATMENTS.map((item) => item.image)).toEqual([
      "/ROG-odonto.webp",
      "/seno-odonto.webp",
    ]);
    expect(DENTISTRY_COMMON_TREATMENTS.map((item) => item.image)).toEqual([
      "/general-odonto.webp",
      "/lab-odonto.webp",
      "/invisible-odonto.webp",
      "/limpieza-odonto.webp",
      "/tc-odonto.webp",
      "/carilla-odonto.webp",
    ]);
    expect(NUTRITION_SERVICES).toHaveLength(4);
    expect(NUTRITION_SERVICES.map((service) => service.image)).toEqual([
      "/bajar-peso.webp",
      "/nutricion-deportiva-hd.webp",
      "/alimentacion-saludable-hd.webp",
      "/nutricion-clinica-hd.webp",
    ]);
    expect(GOOGLE_REVIEWS.map((review) => review.image)).toEqual([
      "/martin-zudaire.webp",
      "/facundo-feltrin.webp",
      "/lucio-perez.webp",
    ]);
    expect(GOOGLE_REVIEWS.every((review) => review.image.endsWith(".webp"))).toBe(
      true,
    );
  });
});
