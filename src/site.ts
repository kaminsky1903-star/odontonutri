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

export const DENTISTRY_FEATURED_TREATMENT = {
  title: "Implantes Dentales",
  description:
    "Recuperá función, estabilidad y estética mediante soluciones implantológicas planificadas para cada caso.",
  benefits: [
    "Planificación personalizada",
    "Resultados funcionales y estéticos",
    "Tecnología aplicada al diagnóstico",
  ],
  image: "/implante-odonto.webp",
  alt: "Planificación de implantes dentales",
  objectPosition: "32% 48%",
  message: "Hola, quisiera consultar por Implantes Dentales.",
} as const;

export const DENTISTRY_ADVANCED_TREATMENTS = [
  {
    title: "Regeneración Ósea Guiada",
    description:
      "Procedimientos destinados a recuperar volumen óseo y generar condiciones favorables para la colocación de implantes.",
    image: "/ROG-odonto.webp",
    alt: "Regeneración ósea guiada",
    objectPosition: "50% 46%",
    message: "Hola, quisiera consultar por Regeneración Ósea Guiada.",
  },
  {
    title: "Levantamiento de Seno Maxilar",
    description:
      "Técnica indicada para aumentar la disponibilidad ósea en sectores posteriores del maxilar superior para colocación de implantes.",
    image: "/seno-odonto.webp",
    alt: "Levantamiento de seno maxilar",
    objectPosition: "48% 42%",
    message: "Hola, quisiera consultar por Levantamiento de Seno Maxilar.",
  },
] as const;

export const DENTISTRY_COMMON_TREATMENTS = [
  {
    title: "Odontología General",
    description:
      "Prevención, diagnóstico y cuidado integral de tu salud bucal.",
    image: "/general-odonto.webp",
    alt: "Consulta odontológica general",
    objectPosition: "42% 28%",
    message: "Hola, quisiera consultar por Odontología General.",
  },
  {
    title: "Prótesis y Rehabilitación Oral",
    description:
      "Recuperamos función y estética mediante soluciones protésicas personalizadas.",
    image: "/lab-odonto.webp",
    alt: "Prótesis y rehabilitación oral",
    objectPosition: "50% 42%",
    message: "Hola, quisiera consultar por Prótesis y Rehabilitación Oral.",
  },
  {
    title: "Alineadores Invisibles",
    description:
      "Corrección de la posición dental mediante alineadores transparentes y removibles.",
    image: "/invisible-odonto.webp",
    alt: "Alineadores invisibles",
    objectPosition: "55% 40%",
    message: "Hola, quisiera consultar por Alineadores Invisibles.",
  },
  {
    title: "Limpieza Dental",
    description:
      "Eliminación profesional de placa y cálculo para mantener dientes y encías saludables.",
    image: "/limpieza-odonto.webp",
    alt: "Limpieza dental profesional",
    objectPosition: "50% 45%",
    message: "Hola, quisiera consultar por Limpieza Dental.",
  },
  {
    title: "Tratamiento de Conducto",
    description:
      "Tratamiento orientado a conservar piezas dentarias afectadas en su tejido pulpar.",
    image: "/tc-odonto.webp",
    alt: "Tratamiento de conducto",
    objectPosition: "48% 40%",
    message: "Hola, quisiera consultar por Tratamiento de Conducto.",
  },
  {
    title: "Carillas Dentales",
    description:
      "Soluciones estéticas para mejorar forma, proporción y apariencia de la sonrisa.",
    image: "/carilla-odonto.webp",
    alt: "Carillas dentales",
    objectPosition: "58% 38%",
    message: "Hola, quisiera consultar por Carillas Dentales.",
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
