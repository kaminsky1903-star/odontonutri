import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ADMIN_METADATA,
  applyPageMetadata,
  HOME_METADATA,
  NUTRICION_METADATA,
  ODONTOLOGIA_METADATA,
  parseJsonLd,
  PUBLIC_PATHS,
} from "./seo";
import {
  DENTISTRY_ADVANCED_TREATMENTS,
  DENTISTRY_COMMON_TREATMENTS,
  DENTISTRY_FEATURED_TREATMENT,
  NUTRITION_SERVICES,
  PHONE_LABEL,
  PHONE_TEL,
  SITE_NAME,
  SITE_URL,
  STREET_ADDRESS,
  WHATSAPP_PAGE,
} from "./site";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readPublic(name: string) {
  return readFileSync(join(root, "public", name), "utf8");
}

const indexHtml = readFileSync(join(root, "index.html"), "utf8");

describe("search appearance", () => {
  it("has a scannable title and description for Google and Bing", () => {
    const html = applyPageMetadata(indexHtml, HOME_METADATA);

    expect(html).toContain(`<title data-seo="title">${HOME_METADATA.title}</title>`);
    expect(html).toContain(`content="${HOME_METADATA.description}"`);
    expect(html).toContain(`<link data-seo="canonical" rel="canonical" href="${SITE_URL}" />`);
    expect(html).toContain('property="og:image"');
    expect(html).toContain(`${SITE_URL}og-image.png`);
    expect(html).toContain('hreflang="es-AR"');
    expect(html).toContain('hreflang="x-default"');
    expect(html).toContain('rel="preload"');
    expect(html).toContain('href="/nosotros-hero.webp"');
    expect(indexHtml).toContain(PHONE_LABEL);
  });

  it("uses distinct initial metadata for each public route", () => {
    const pages = [HOME_METADATA, ODONTOLOGIA_METADATA, NUTRICION_METADATA];
    const titles = new Set(pages.map((page) => page.title));
    const canonicals = new Set(pages.map((page) => page.canonical));

    expect(titles.size).toBe(3);
    expect(canonicals.size).toBe(3);
    expect(PUBLIC_PATHS).toEqual(["/", "/odontologia", "/nutricion"]);

    for (const page of pages) {
      const html = applyPageMetadata(indexHtml, page);
      expect(html).toContain(`<title data-seo="title">${page.title}</title>`);
      expect(html).toContain(`content="${page.description}"`);
      expect(html).toContain(`href="${page.canonical}"`);
      expect(html).toContain(`property="og:url"`);
      expect(html).toContain(`property="og:title"`);
      expect(html).toContain(`property="og:description"`);
      expect(html).toContain(`name="twitter:title"`);
      expect(html).toContain(`name="twitter:description"`);
      expect(html).toContain(page.preload);
      expect(html).toContain(`<h1>${page.title}</h1>`);
    }
  });

  it("embeds valid JSON-LD graphs that match visible clinic data", () => {
    const home = parseJsonLd(applyPageMetadata(indexHtml, HOME_METADATA)) as {
      "@graph": Array<Record<string, unknown>>;
    };
    const odontologia = parseJsonLd(
      applyPageMetadata(indexHtml, ODONTOLOGIA_METADATA),
    ) as { "@graph": Array<Record<string, unknown>> };
    const nutricion = parseJsonLd(
      applyPageMetadata(indexHtml, NUTRICION_METADATA),
    ) as { "@graph": Array<Record<string, unknown>> };

    const business = home["@graph"].find((node) => node["@type"] === "LocalBusiness");
    expect(business).toMatchObject({
      name: SITE_NAME,
      telephone: PHONE_TEL,
      url: SITE_URL,
    });
    expect(JSON.stringify(business)).toContain(
      STREET_ADDRESS.replace("Av.", "Avenida"),
    );
    expect(JSON.stringify(business)).not.toContain("Dentist");
    expect(home["@graph"].some((node) => node["@type"] === "WebSite")).toBe(true);
    expect(home["@graph"].some((node) => node["@type"] === "WebPage")).toBe(true);
    expect(
      home["@graph"].some(
        (node) => node["@type"] === "Person" && node.name === "Dr. Kaminsky",
      ),
    ).toBe(true);
    expect(
      home["@graph"].some(
        (node) => node["@type"] === "Person" && node.name === "Lic. González",
      ),
    ).toBe(true);
    expect(JSON.stringify(home)).not.toContain("AggregateRating");
    expect(JSON.stringify(home)).not.toContain("openingHours");

    const dentist = odontologia["@graph"].find((node) => node["@type"] === "Dentist");
    expect(dentist).toBeTruthy();
    expect(JSON.stringify(dentist)).toContain(DENTISTRY_FEATURED_TREATMENT.title);
    for (const treatment of [
      ...DENTISTRY_ADVANCED_TREATMENTS,
      ...DENTISTRY_COMMON_TREATMENTS,
    ]) {
      expect(JSON.stringify(dentist)).toContain(treatment.title);
    }
    expect(
      odontologia["@graph"].some((node) => node["@type"] === "BreadcrumbList"),
    ).toBe(true);

    const nutrition = nutricion["@graph"].find(
      (node) => node["@type"] === "ProfessionalService",
    );
    expect(nutrition).toBeTruthy();
    for (const service of NUTRITION_SERVICES) {
      expect(JSON.stringify(nutrition)).toContain(service.title);
    }
    expect(
      nutricion["@graph"].some((node) => node["@type"] === "BreadcrumbList"),
    ).toBe(true);
  });

  it("publishes robots and a sitemap for the canonical host", () => {
    const robots = readPublic("robots.txt");
    const sitemap = readPublic("sitemap.xml");
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );

    expect(robots).toContain("Allow: /");
    expect(robots).toMatch(/disallow:\s*\/admin/i);
    expect(robots).not.toMatch(/disallow:\s*\/favicon/i);
    expect(robots).toContain(`${SITE_URL}sitemap.xml`);
    expect(locs).toEqual([
      SITE_URL,
      "https://www.odontonutri.com/odontologia",
      "https://www.odontonutri.com/nutricion",
    ]);
    expect(sitemap).not.toContain("/admin");
    expect(sitemap).not.toContain("whatsapp.html");
  });

  it("does not use the generic SPA asset fallback for unknown URLs", () => {
    const wrangler = readFileSync(join(root, "wrangler.jsonc"), "utf8");
    expect(wrangler).toContain('"binding": "ASSETS"');
    expect(wrangler).toContain('"run_worker_first": true');
    expect(wrangler).toContain('"not_found_handling": "none"');
    expect(wrangler).not.toContain("single-page-application");
  });

  it("marks the admin area as noindex in the initial document metadata", () => {
    const html = applyPageMetadata(indexHtml, ADMIN_METADATA);
    expect(html).toContain(`content="${ADMIN_METADATA.robots}"`);
    expect(html).toContain(ADMIN_METADATA.title);
    expect(html).not.toContain('href="/nosotros-hero.webp"');
  });

  it("keeps env files and credential dumps out of git", () => {
    const ignore = readFileSync(join(root, ".gitignore"), "utf8");
    const envExample = readFileSync(join(root, ".env.example"), "utf8");
    expect(ignore).toMatch(/^\.env$/m);
    expect(ignore).toContain(".env.local");
    expect(ignore).toContain(".dev.vars");
    expect(ignore).toContain("*service-account*.json");
    expect(envExample).toContain("VITE_SUPABASE_PUBLISHABLE_KEY=");
    expect(envExample).not.toContain("VITE_SUPABASE_ANON_KEY");
    expect(envExample).not.toContain("sb_secret_");
    expect(envExample).not.toContain("service_role");
  });

  it("publishes a real WhatsApp handoff page for conversion tracking", () => {
    const page = readPublic("whatsapp.html");

    expect(page).toContain("<h1>Abriendo WhatsApp…</h1>");
    expect(page).toContain(`href="${SITE_URL}whatsapp.html"`);
    expect(page).toContain("URLSearchParams(window.location.search).get(\"text\")");
    expect(page).toContain("https://wa.me/541161370040?text=");
    expect(page).toContain(
      'gtag("config", "G-SFZ22LKWP4", { send_page_view: false })',
    );
    expect(page).toContain(
      'gtag("event", "ads_conversion_Whastapp_1"',
    );
    expect(page).toContain('send_to: "G-SFZ22LKWP4"');
    expect(page).toContain("event_callback");
    expect(page).toContain("window.location.replace(destination)");
    expect(page).toMatch(/setTimeout\(redirectToWhatsApp,\s*2500\)/);
    expect(page).not.toMatch(/http-equiv=["']refresh["']/i);
    expect(page).not.toMatch(/AW-\d+/);
    expect(WHATSAPP_PAGE).toBe("/whatsapp.html");
  });

  it("declares square favicon files Google Search can crawl", () => {
    expect(indexHtml).toContain(
      '<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="48x48" />',
    );
    expect(indexHtml).toContain(
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />',
    );
    expect(indexHtml).toContain(
      '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />',
    );
    expect(indexHtml).toContain(
      '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />',
    );
    expect(indexHtml).toContain(
      '<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />',
    );
    expect(indexHtml).toContain(
      '<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />',
    );
    expect(indexHtml).toContain('rel="apple-touch-icon"');
    expect(indexHtml).toContain('type="image/png"');
    expect(indexHtml).toContain('sizes="180x180"');
    expect(indexHtml).toContain('href="/apple-touch-icon.png"');

    const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const pngs: Array<[string, number]> = [
      ["favicon-32x32.png", 32],
      ["favicon-48x48.png", 48],
      ["favicon-96x96.png", 96],
      ["favicon-192x192.png", 192],
      ["favicon-512x512.png", 512],
      ["apple-touch-icon.png", 180],
    ];

    for (const [name, size] of pngs) {
      const png = Buffer.from(readFileSync(join(root, "public", name)));
      expect(png.subarray(0, 8)).toEqual(pngSig);
      expect(png.readUInt32BE(16)).toBe(size);
      expect(png.readUInt32BE(20)).toBe(size);
      expect(png[24]).toBe(8);
      expect(png[25]).toBe(6);
    }

    const ico = readFileSync(join(root, "public", "favicon.ico"));
    expect(ico.subarray(0, 6)).toEqual(Buffer.from([0, 0, 1, 0, 3, 0]));
  });
});
