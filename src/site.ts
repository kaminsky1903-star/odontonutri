export const SITE_NAME = "Odontología y Nutrición";
export const SITE_URL = "https://www.odontonutri.com/";
export const PHONE_TEL = "+541161370040";
export const PHONE_LABEL = "11 6137 0040";
export const INSTAGRAM_URL = "https://www.instagram.com/odontologia.nutricion/";
export const INSTAGRAM_HANDLE = "@odontologia.nutricion";
export const WHATSAPP_URL = "https://wa.link/g6wqj3";
export const WHATSAPP_PAGE = "/whatsapp.html";
export const WHATSAPP_NUTRITION_MESSAGE =
  "Hola, quisiera agendar una consulta de nutrición.";
export const WHATSAPP_NUTRITION_PAGE = `${WHATSAPP_PAGE}?text=${encodeURIComponent(WHATSAPP_NUTRITION_MESSAGE)}`;

export function whatsappPageWithMessage(message: string) {
  return `${WHATSAPP_PAGE}?text=${encodeURIComponent(message)}`;
}

export const NUTRITION_SERVICES = [
  {
    title: "Alimentación saludable",
    description: "Hábitos sostenibles para una vida más saludable.",
    features: ["Hábitos", "Equilibrio"],
    image: "/alimentacion-saludable-hd.png",
    message: "Hola, quisiera consultar el servicio de Alimentación saludable.",
  },
  {
    title: "Nutrición deportiva",
    description:
      "Planes personalizados para mejorar tu rendimiento y composición corporal.",
    features: ["Rendimiento", "Composición corporal"],
    image: "/nutricion-deportiva-hd.png",
    message: "Hola, quisiera consultar el servicio de Nutrición deportiva.",
  },
  {
    title: "Nutrición clínica",
    description: "Acompañamiento nutricional en distintas patologías.",
    features: ["Evaluación profesional", "Seguimiento"],
    image: "/nutricion-clinica-hd.png",
    message: "Hola, quisiera consultar el servicio de Nutrición clínica.",
  },
] as const;
export const MAP_QUERY =
  "Av.+Senador+Moron+858,+Bella+Vista,+Buenos+Aires,+Argentina";
export const STREET_ADDRESS = "Av. Senador Morón 858";
export const THEME_KEY = "odontonutri-theme";
export type ThemeMode = "light" | "dark" | "auto";
