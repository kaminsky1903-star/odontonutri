import {
  ADMIN_PATH,
  DENTISTRY_ADVANCED_TREATMENTS,
  DENTISTRY_COMMON_TREATMENTS,
  DENTISTRY_FEATURED_TREATMENT,
  INSTAGRAM_URL,
  MAP_QUERY,
  NUTRITION_SERVICES,
  PHONE_LABEL,
  PHONE_TEL,
  SITE_NAME,
  SITE_URL,
  STREET_ADDRESS,
} from "./site";

export const OG_IMAGE_URL = `${SITE_URL}og-image.png`;
export const PUBLIC_ROBOTS = "index, follow";
export const ADMIN_ROBOTS = "noindex, nofollow, noarchive";

export const PUBLIC_PATHS = ["/", "/odontologia", "/nutricion"] as const;

export type PublicPath = (typeof PUBLIC_PATHS)[number];

export type PageMetadata = {
  path: string;
  canonical: string;
  title: string;
  description: string;
  robots: string;
  preload: string | null;
  noscriptInner: string;
  jsonLd: unknown;
};

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "Avenida Senador Morón 858",
  addressLocality: "Bella Vista",
  addressRegion: "Buenos Aires",
  postalCode: "1661",
  addressCountry: "AR",
} as const;

const GEO = {
  "@type": "GeoCoordinates",
  latitude: -34.5637,
  longitude: -58.6903,
} as const;

const AREA_SERVED = [
  { "@type": "City", name: "Bella Vista" },
  { "@type": "AdministrativeArea", name: "San Miguel" },
] as const;

const HAS_MAP = `https://www.google.com/maps/search/?api=1&query=${MAP_QUERY}`;
const BUSINESS_ID = `${SITE_URL}#negocio`;
const WEBSITE_ID = `${SITE_URL}#sitio`;
const KAMINSKY_ID = `${SITE_URL}#kaminsky`;
const GONZALEZ_ID = `${SITE_URL}#gonzalez`;
const ODONTOLOGIA_URL = `${SITE_URL}odontologia`;
const NUTRICION_URL = `${SITE_URL}nutricion`;

const DENTISTRY_TREATMENTS = [
  DENTISTRY_FEATURED_TREATMENT,
  ...DENTISTRY_ADVANCED_TREATMENTS,
  ...DENTISTRY_COMMON_TREATMENTS,
];

function offerCatalog(name: string, titles: readonly string[]) {
  return {
    "@type": "OfferCatalog",
    name,
    itemListElement: titles.map((title) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: title,
      },
    })),
  };
}

function personKaminsky() {
  return {
    "@type": "Person",
    "@id": KAMINSKY_ID,
    name: "Dr. Kaminsky",
    jobTitle: "Odontólogo",
  };
}

function personGonzalez() {
  return {
    "@type": "Person",
    "@id": GONZALEZ_ID,
    name: "Lic. González",
    jobTitle: "Nutricionista",
  };
}

function breadcrumb(pageUrl: string, pageName: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: pageName,
        item: pageUrl,
      },
    ],
  };
}

function noscriptInner(title: string, description: string) {
  return `
      <h1>${escapeHtml(title)}</h1>
      <p>
        ${escapeHtml(description)}
      </p>
      <p>${escapeHtml(STREET_ADDRESS)}, Bella Vista. Tel. ${PHONE_LABEL}.</p>
    `;
}

const HOME_TITLE = "Odontología y Nutrición en Bella Vista, San Miguel";
const HOME_DESCRIPTION =
  "Implantes, rehabilitación y estética dental, nutrición clínica y deportiva en Bella Vista, San Miguel. Turnos por WhatsApp: 11 6137 0040.";
const ODONTOLOGIA_TITLE =
  "Implantes y odontología en Bella Vista | Dr. Kaminsky";
const ODONTOLOGIA_DESCRIPTION =
  "Implantes dentales, regeneración ósea, levantamiento de seno, rehabilitación y estética dental en Bella Vista, San Miguel. Pedí tu consulta.";
const NUTRICION_TITLE =
  "Nutricionista en Bella Vista, San Miguel | Lic. González";
const NUTRICION_DESCRIPTION =
  "Nutrición clínica y deportiva, pérdida de peso, ganancia muscular y alimentación saludable en Bella Vista, San Miguel. Agendá tu consulta.";

function homeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": BUSINESS_ID,
        name: SITE_NAME,
        alternateName: ["Odontonutri", "odontologia.nutricion"],
        url: SITE_URL,
        image: OG_IMAGE_URL,
        logo: `${SITE_URL}logo.png`,
        description: HOME_DESCRIPTION,
        telephone: PHONE_TEL,
        address: POSTAL_ADDRESS,
        geo: GEO,
        areaServed: AREA_SERVED,
        sameAs: [INSTAGRAM_URL],
        hasMap: HAS_MAP,
        knowsLanguage: "es",
        currenciesAccepted: "ARS",
        employee: [{ "@id": KAMINSKY_ID }, { "@id": GONZALEZ_ID }],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "es-AR",
        publisher: { "@id": BUSINESS_ID },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}#webpage`,
        url: SITE_URL,
        name: HOME_TITLE,
        description: HOME_DESCRIPTION,
        inLanguage: "es-AR",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": BUSINESS_ID },
      },
      personKaminsky(),
      personGonzalez(),
    ],
  };
}

function dentistryJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${ODONTOLOGIA_URL}#webpage`,
        url: ODONTOLOGIA_URL,
        name: ODONTOLOGIA_TITLE,
        description: ODONTOLOGIA_DESCRIPTION,
        inLanguage: "es-AR",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${ODONTOLOGIA_URL}#consultorio` },
        breadcrumb: { "@id": `${ODONTOLOGIA_URL}#breadcrumb` },
      },
      {
        "@type": "Dentist",
        "@id": `${ODONTOLOGIA_URL}#consultorio`,
        name: `Odontología — ${SITE_NAME}`,
        url: ODONTOLOGIA_URL,
        telephone: PHONE_TEL,
        address: POSTAL_ADDRESS,
        hasMap: HAS_MAP,
        parentOrganization: { "@id": BUSINESS_ID },
        employee: { "@id": KAMINSKY_ID },
        hasOfferCatalog: offerCatalog(
          "Tratamientos odontológicos",
          DENTISTRY_TREATMENTS.map((item) => item.title),
        ),
      },
      personKaminsky(),
      breadcrumb(ODONTOLOGIA_URL, "Odontología"),
    ],
  };
}

function nutritionJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${NUTRICION_URL}#webpage`,
        url: NUTRICION_URL,
        name: NUTRICION_TITLE,
        description: NUTRICION_DESCRIPTION,
        inLanguage: "es-AR",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": `${NUTRICION_URL}#consultorio` },
        breadcrumb: { "@id": `${NUTRICION_URL}#breadcrumb` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${NUTRICION_URL}#consultorio`,
        name: `Nutrición — ${SITE_NAME}`,
        url: NUTRICION_URL,
        telephone: PHONE_TEL,
        address: POSTAL_ADDRESS,
        hasMap: HAS_MAP,
        parentOrganization: { "@id": BUSINESS_ID },
        employee: { "@id": GONZALEZ_ID },
        hasOfferCatalog: offerCatalog(
          "Servicios de nutrición",
          NUTRITION_SERVICES.map((item) => item.title),
        ),
      },
      personGonzalez(),
      breadcrumb(NUTRICION_URL, "Nutrición"),
    ],
  };
}

export const HOME_METADATA: PageMetadata = {
  path: "/",
  canonical: SITE_URL,
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  robots: PUBLIC_ROBOTS,
  preload: "/nosotros-hero.webp",
  noscriptInner: noscriptInner(HOME_TITLE, HOME_DESCRIPTION),
  jsonLd: homeJsonLd(),
};

export const ODONTOLOGIA_METADATA: PageMetadata = {
  path: "/odontologia",
  canonical: ODONTOLOGIA_URL,
  title: ODONTOLOGIA_TITLE,
  description: ODONTOLOGIA_DESCRIPTION,
  robots: PUBLIC_ROBOTS,
  preload: "/hero-odonto.webp",
  noscriptInner: noscriptInner(ODONTOLOGIA_TITLE, ODONTOLOGIA_DESCRIPTION),
  jsonLd: dentistryJsonLd(),
};

export const NUTRICION_METADATA: PageMetadata = {
  path: "/nutricion",
  canonical: NUTRICION_URL,
  title: NUTRICION_TITLE,
  description: NUTRICION_DESCRIPTION,
  robots: PUBLIC_ROBOTS,
  preload: "/nutricion-hero.webp",
  noscriptInner: noscriptInner(NUTRICION_TITLE, NUTRICION_DESCRIPTION),
  jsonLd: nutritionJsonLd(),
};

export const ADMIN_METADATA: PageMetadata = {
  path: ADMIN_PATH,
  canonical: `${SITE_URL}admin`,
  title: `Panel de analíticas | ${SITE_NAME}`,
  description: `Acceso privado al panel de analíticas de ${SITE_NAME}.`,
  robots: ADMIN_ROBOTS,
  preload: null,
  noscriptInner: `
      <h1>Panel de analíticas</h1>
    `,
  jsonLd: {
    "@context": "https://schema.org",
    "@graph": [],
  },
};

export function normalizePathname(pathname: string): string {
  const path = decodeURIComponent(pathname.split(/[?#]/)[0] || "/");
  if (path === "/" || path === "") {
    return "/";
  }
  return path.replace(/\/+$/, "") || "/";
}

export function isAdminPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === ADMIN_PATH;
}

export function isPublicPath(pathname: string): pathname is PublicPath {
  return (PUBLIC_PATHS as readonly string[]).includes(
    normalizePathname(pathname),
  );
}

export function isHtmlShellPath(pathname: string): boolean {
  return isPublicPath(pathname) || isAdminPath(pathname);
}

export function metadataForPath(pathname: string): PageMetadata | null {
  if (isAdminPath(pathname)) {
    return ADMIN_METADATA;
  }
  const path = normalizePathname(pathname);
  if (path === "/") {
    return HOME_METADATA;
  }
  if (path === "/odontologia") {
    return ODONTOLOGIA_METADATA;
  }
  if (path === "/nutricion") {
    return NUTRICION_METADATA;
  }
  return null;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function replaceTaggedElement(
  html: string,
  key: string,
  replacer: (tag: string) => string,
): string {
  const re = new RegExp(`<[^>]*data-seo="${key}"[^>]*>`, "i");
  return html.replace(re, replacer);
}

function setTaggedAttr(
  html: string,
  key: string,
  attr: string,
  value: string,
): string {
  return replaceTaggedElement(html, key, (tag) => {
    const encoded = escapeHtml(value);
    const attrRe = new RegExp(`(\\s${attr}=")[^"]*(")`);
    if (attrRe.test(tag)) {
      return tag.replace(attrRe, `$1${encoded}$2`);
    }
    return tag.replace(/(\s*\/?>)$/, ` ${attr}="${encoded}"$1`);
  });
}

export function applyPageMetadata(html: string, page: PageMetadata): string {
  let next = html;
  next = next.replace(
    /<title data-seo="title">[\s\S]*?<\/title>/i,
    `<title data-seo="title">${escapeHtml(page.title)}</title>`,
  );
  next = setTaggedAttr(next, "description", "content", page.description);
  next = setTaggedAttr(next, "robots", "content", page.robots);
  next = setTaggedAttr(next, "googlebot", "content", page.robots);
  next = setTaggedAttr(next, "bingbot", "content", page.robots);
  next = setTaggedAttr(next, "canonical", "href", page.canonical);
  next = setTaggedAttr(next, "hreflang-es", "href", page.canonical);
  next = setTaggedAttr(next, "hreflang-default", "href", page.canonical);
  next = setTaggedAttr(next, "og-url", "content", page.canonical);
  next = setTaggedAttr(next, "og-title", "content", page.title);
  next = setTaggedAttr(next, "og-description", "content", page.description);
  next = setTaggedAttr(next, "twitter-title", "content", page.title);
  next = setTaggedAttr(
    next,
    "twitter-description",
    "content",
    page.description,
  );
  if (page.preload) {
    next = setTaggedAttr(next, "preload", "href", page.preload);
  } else {
    next = next.replace(/\s*<link[^>]*data-seo="preload"[^>]*\/?>/i, "");
  }
  next = next.replace(
    /<script data-seo="json-ld" type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script data-seo="json-ld" type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>`,
  );
  next = next.replace(
    /<noscript data-seo="noscript">[\s\S]*?<\/noscript>/i,
    `<noscript data-seo="noscript">${page.noscriptInner}</noscript>`,
  );
  return next;
}

export function parseJsonLd(html: string): unknown {
  const match = html.match(
    /<script data-seo="json-ld" type="application\/ld\+json">([\s\S]*?)<\/script>/i,
  );
  if (!match) {
    throw new Error("Missing JSON-LD script");
  }
  return JSON.parse(match[1]);
}
