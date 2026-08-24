import { describe, expect, it } from "vitest";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  NUTRITION_SERVICES,
  PHONE_LABEL,
  PHONE_TEL,
  SITE_NAME,
  SITE_URL,
  STREET_ADDRESS,
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
    expect(STREET_ADDRESS).toBe("Av. Senador Morón 858");
  });

  it("exposes reachable contact channels", () => {
    expect(PHONE_TEL).toBe("+541161370040");
    expect(PHONE_LABEL).toBe("11 6137 0040");
    expect(INSTAGRAM_HANDLE).toBe("@odontologia.nutricion");
    expect(INSTAGRAM_URL).toBe(
      "https://www.instagram.com/odontologia.nutricion/",
    );
    expect(WHATSAPP_PAGE).toBe("/whatsapp.html");
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
    expect(NUTRITION_SERVICES).toHaveLength(3);
    expect(NUTRITION_SERVICES.map((service) => service.image)).toEqual([
      "/alimentacion-saludable-hd.png",
      "/nutricion-deportiva-hd.png",
      "/nutricion-clinica-hd.png",
    ]);
  });
});
