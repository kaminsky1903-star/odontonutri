import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  PHONE_LABEL,
  PHONE_TEL,
  SITE_NAME,
  SITE_URL,
  STREET_ADDRESS,
} from "./site";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readPublic(name: string) {
  return readFileSync(join(root, "public", name), "utf8");
}

describe("search appearance", () => {
  const html = readFileSync(join(root, "index.html"), "utf8");

  it("has a scannable title and description for Google and Bing", () => {
    expect(html).toContain(
      `<title>${SITE_NAME} | Bella Vista, San Miguel</title>`,
    );
    expect(html).toMatch(
      /name="description"\s+content="[^"]*Bella Vista[^"]*11 6137 0040/,
    );
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}" />`);
    expect(html).toContain('property="og:image"');
    expect(html).toContain(`${SITE_URL}og-image.png`);
  });

  it("embeds valid LocalBusiness JSON-LD", () => {
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    expect(match).toBeTruthy();
    const data = JSON.parse(match![1]) as {
      "@graph": Array<Record<string, unknown>>;
    };
    const business = data["@graph"].find((node) =>
      Array.isArray(node["@type"])
        ? node["@type"].includes("LocalBusiness")
        : node["@type"] === "LocalBusiness",
    );

    expect(business).toMatchObject({
      name: SITE_NAME,
      telephone: PHONE_TEL,
      url: SITE_URL,
    });
    expect(JSON.stringify(business)).toContain(STREET_ADDRESS.replace("Av.", "Avenida"));
    expect(html).toContain(PHONE_LABEL);
  });

  it("publishes robots and a sitemap for the canonical host", () => {
    const robots = readPublic("robots.txt");
    const sitemap = readPublic("sitemap.xml");

    expect(robots).toContain("Allow: /");
    expect(robots).toContain(`${SITE_URL}sitemap.xml`);
    expect(sitemap).toContain(`<loc>${SITE_URL}</loc>`);
  });
});
