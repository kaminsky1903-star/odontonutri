export const SITE_NAME = "Odontología y Nutrición";
export const SITE_URL = "https://www.odontonutri.com/";
export const PHONE_TEL = "+541161370040";
export const PHONE_LABEL = "11 6137 0040";
export const INSTAGRAM_URL = "https://www.instagram.com/odontologia.nutricion/";
export const INSTAGRAM_HANDLE = "@odontologia.nutricion";
export const WHATSAPP_URL = "https://wa.link/g6wqj3";
export const WHATSAPP_PAGE = "/whatsapp.html";
export const ADMIN_PATH = "/admin";
export const WHATSAPP_NUTRITION_MESSAGE =
  "Hola, quisiera agendar una consulta de nutrición.";
export const WHATSAPP_NUTRITION_PAGE = `${WHATSAPP_PAGE}?text=${encodeURIComponent(WHATSAPP_NUTRITION_MESSAGE)}`;

export function whatsappPageWithMessage(message: string) {
  return `${WHATSAPP_PAGE}?text=${encodeURIComponent(message)}`;
}

export const NUTRITION_SERVICES = [
  {
    title: "Pérdida de peso",
    description:
      "Plan personalizado para bajar de peso de forma saludable y sostenible.",
    features: ["Déficit saludable", "Hábitos sostenibles"],
    image: "/bajar-peso.webp",
    message: "Hola, quisiera consultar el servicio de Pérdida de peso.",
  },
  {
    title: "Ganancia muscular",
    description:
      "Planes personalizados para mejorar tu rendimiento y composición corporal.",
    features: ["Rendimiento", "Composición corporal"],
    image: "/nutricion-deportiva-hd.webp",
    message: "Hola, quisiera consultar el servicio de Ganancia muscular.",
  },
  {
    title: "Alimentación saludable",
    description: "Hábitos sostenibles para una vida más saludable.",
    features: ["Hábitos", "Equilibrio"],
    image: "/alimentacion-saludable-hd.webp",
    message: "Hola, quisiera consultar el servicio de Alimentación saludable.",
  },
  {
    title: "Nutrición clínica",
    description: "Acompañamiento nutricional en distintas patologías.",
    features: ["Evaluación profesional", "Seguimiento"],
    image: "/nutricion-clinica-hd.webp",
    message: "Hola, quisiera consultar el servicio de Nutrición clínica.",
  },
] as const;

export const GOOGLE_REVIEWS = [
  {
    name: "Martin Zudaire",
    image: "/martin-zudaire.webp",
    quote:
      "Muy buena atención de la nutricionista. Me explicó todo súper claro y armamos un plan que realmente se adapta a mis horarios y a lo que como normalmente. Nada imposible de seguir. Muy recomendable.",
    meta: "2 reseñas",
    featured: false,
  },
  {
    name: "Facundo Francisco Feltrin",
    image: "/facundo-feltrin.webp",
    quote:
      "Estefanía me dio una dieta equilibrada para mejorar musculación con un presupuesto más al bolsillo del día a día. Genial!",
    meta: "Local Guide · 30 reseñas · 17 fotos",
    featured: true,
  },
  {
    name: "Lucio Perez",
    image: "/lucio-perez.webp",
    quote:
      "Excelente la nutri. Te explica todo bárbaro y te arma un plan realista, sin pedirte cosas raras como me pasó con otros. La re recomiendo.",
    meta: "Local Guide · 12 reseñas · 19 fotos",
    featured: false,
  },
] as const;

export const MAP_QUERY =
  "Av.+Senador+Moron+858,+Bella+Vista,+Buenos+Aires,+Argentina";
export const STREET_ADDRESS = "Av. Senador Morón 858";
