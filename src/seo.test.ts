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
    expect(robots).not.toMatch(/disallow:\s*\/favicon/i);
    expect(robots).toContain(`${SITE_URL}sitemap.xml`);
    expect(sitemap).toContain(`<loc>${SITE_URL}</loc>`);
  });

  it("declares square favicon files Google Search can crawl", () => {
    expect(html).toContain(
      '<link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="48x48" />',
    );
    expect(html).toContain(
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />',
    );
    expect(html).toContain(
      '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />',
    );
    expect(html).toContain(
      '<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />',
    );
    expect(html).toContain(
      '<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />',
    );
    expect(html).toContain(
      '<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />',
    );
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain('type="image/png"');
    expect(html).toContain('sizes="180x180"');
    expect(html).toContain('href="/apple-touch-icon.png"');

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
