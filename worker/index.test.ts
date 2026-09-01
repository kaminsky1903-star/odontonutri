import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  ADMIN_ROBOTS,
  HOME_METADATA,
  NUTRICION_METADATA,
  ODONTOLOGIA_METADATA,
  parseJsonLd,
} from "../src/seo";
import worker from "./index";

type WorkerEnv = {
  ASSETS?: Fetcher;
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = readFileSync(join(root, "index.html"), "utf8");
const robotsTxt = readFileSync(join(root, "public", "robots.txt"), "utf8");
const emptyEnv = {} as WorkerEnv;

const fetchWorker = (input: string | Request, env: WorkerEnv = emptyEnv) =>
  (
    worker.fetch as (
      request: Request,
      env: WorkerEnv,
      ctx: ExecutionContext,
    ) => Promise<Response>
  )(
    typeof input === "string" ? new Request(input) : input,
    env,
    {} as ExecutionContext,
  );

function assetsEnv() {
  const fetched: string[] = [];
  const env = {
    ASSETS: {
      fetch: async (input: RequestInfo | URL) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof Request
              ? input.url
              : input.toString();
        fetched.push(new URL(url).pathname);
        const path = new URL(url).pathname;
        if (path === "/index.html" || path === "/") {
          return new Response(indexHtml, {
            status: 200,
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
        if (path === "/robots.txt") {
          return new Response(robotsTxt, {
            status: 200,
            headers: { "content-type": "text/plain; charset=utf-8" },
          });
        }
        if (path === "/logo.png") {
          return new Response("png", {
            status: 200,
            headers: { "content-type": "image/png" },
          });
        }
        return new Response(null, { status: 404 });
      },
    },
    fetched,
  };
  return env as unknown as WorkerEnv & { fetched: string[] };
}

describe("worker", () => {
  it("redirects the apex domain to https www and keeps the query string", async () => {
    const response = await fetchWorker("https://odontonutri.com/visita?utm=ig");

    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(
      "https://www.odontonutri.com/visita?utm=ig",
    );
  });

  it("does not loop Wrangler local HTTPS previews on a custom port", async () => {
    const response = await fetchWorker(
      "http://www.odontonutri.com:8790/odontologia",
      assetsEnv(),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain(ODONTOLOGIA_METADATA.title);
  });

  it("keeps Wrangler local previews from redirecting to production", async () => {
    const response = await fetchWorker(
      new Request("http://odontonutri.com/odontologia", {
        headers: { "CF-Connecting-IP": "127.0.0.1" },
      }),
      assetsEnv(),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain(ODONTOLOGIA_METADATA.title);
  });

  it("redirects http www routes to https www", async () => {
    const response = await fetchWorker(
      "http://www.odontonutri.com/odontologia",
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(
      "https://www.odontonutri.com/odontologia",
    );
  });

  it("redirects http apex specialty routes to https www", async () => {
    const response = await fetchWorker("http://odontonutri.com/nutricion");

    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(
      "https://www.odontonutri.com/nutricion",
    );
  });

  it("redirects trailing slashes with a 301 and keeps UTM parameters", async () => {
    const odontologia = await fetchWorker(
      "https://www.odontonutri.com/odontologia/?utm_source=instagram",
    );
    const nutricion = await fetchWorker(
      "http://odontonutri.com/nutricion/?utm_medium=bio",
    );

    expect(odontologia.status).toBe(301);
    expect(odontologia.headers.get("Location")).toBe(
      "https://www.odontonutri.com/odontologia?utm_source=instagram",
    );
    expect(nutricion.status).toBe(301);
    expect(nutricion.headers.get("Location")).toBe(
      "https://www.odontonutri.com/nutricion?utm_medium=bio",
    );
  });

  it("redirects /index.html to the canonical home URL", async () => {
    const response = await fetchWorker(
      "https://www.odontonutri.com/index.html?utm_source=ig",
    );

    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(
      "https://www.odontonutri.com/?utm_source=ig",
    );
  });

  it("redirects the apex favicon to the canonical www URL", async () => {
    const response = await fetchWorker("https://odontonutri.com/favicon.ico");

    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(
      "https://www.odontonutri.com/favicon.ico",
    );
  });

  it("returns the clinic name from /api/", async () => {
    const response = await fetchWorker("https://www.odontonutri.com/api/");

    expect(response.headers.get("content-type")).toMatch(/json/);
    await expect(response.json()).resolves.toEqual({
      name: "Odontología y Nutrición",
    });
  });

  it("serves public HTML routes from the SPA shell without a navigate header", async () => {
    const env = assetsEnv();
    const home = await fetchWorker("https://www.odontonutri.com/", env);
    const odontologia = await fetchWorker(
      "https://www.odontonutri.com/odontologia",
      env,
    );
    const nutricion = await fetchWorker(
      "https://www.odontonutri.com/nutricion",
      env,
    );

    expect(home.status).toBe(200);
    expect(odontologia.status).toBe(200);
    expect(nutricion.status).toBe(200);
    expect(env.fetched.every((path) => path === "/index.html")).toBe(true);

    const homeHtml = await home.text();
    const odontologiaHtml = await odontologia.text();
    const nutricionHtml = await nutricion.text();

    expect(homeHtml).toContain(`<title data-seo="title">${HOME_METADATA.title}</title>`);
    expect(homeHtml).toContain(`href="${HOME_METADATA.canonical}"`);
    expect(homeHtml).toContain(`content="${HOME_METADATA.description}"`);
    expect(odontologiaHtml).toContain(
      `<title data-seo="title">${ODONTOLOGIA_METADATA.title}</title>`,
    );
    expect(odontologiaHtml).toContain(
      `href="${ODONTOLOGIA_METADATA.canonical}"`,
    );
    expect(nutricionHtml).toContain(
      `<title data-seo="title">${NUTRICION_METADATA.title}</title>`,
    );
    expect(nutricionHtml).toContain(`href="${NUTRICION_METADATA.canonical}"`);
    expect(odontologiaHtml).not.toContain(HOME_METADATA.title);
    expect(nutricionHtml).not.toContain(HOME_METADATA.title);
  });

  it("embeds parseable JSON-LD for each public page", async () => {
    const env = assetsEnv();
    const pages = [
      ["https://www.odontonutri.com/", "LocalBusiness"],
      ["https://www.odontonutri.com/odontologia", "Dentist"],
      ["https://www.odontonutri.com/nutricion", "ProfessionalService"],
    ] as const;

    for (const [url, type] of pages) {
      const html = await (await fetchWorker(url, env)).text();
      const data = parseJsonLd(html) as {
        "@graph": Array<Record<string, unknown>>;
      };
      expect(Array.isArray(data["@graph"])).toBe(true);
      expect(
        data["@graph"].some((node) => {
          const nodeType = node["@type"];
          return nodeType === type;
        }),
      ).toBe(true);
    }
  });

  it("returns a real 404 for unknown HTML routes", async () => {
    const env = assetsEnv();
    const response = await fetchWorker(
      "https://www.odontonutri.com/esta-ruta-no-existe",
      env,
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toContain("Página no encontrada");
    expect((await fetchWorker("https://www.odontonutri.com/", env)).status).toBe(
      200,
    );
  });

  it("keeps /admin noindexed in the initial HTML and robots header", async () => {
    const response = await fetchWorker(
      "https://www.odontonutri.com/admin",
      assetsEnv(),
    );
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toBe(ADMIN_ROBOTS);
    expect(html).toContain(`content="${ADMIN_ROBOTS}"`);
    expect(html).toContain("Panel de analíticas | Odontología y Nutrición");
  });

  it("still serves static assets and robots.txt", async () => {
    const env = assetsEnv();
    const logo = await fetchWorker("https://www.odontonutri.com/logo.png", env);
    const robots = await fetchWorker(
      "https://www.odontonutri.com/robots.txt",
      env,
    );

    expect(logo.status).toBe(200);
    expect(logo.headers.get("content-type")).toMatch(/png/);
    expect(robots.status).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");
  });

  it("rejects analytics requests without a bearer token", async () => {
    const response = await fetchWorker(
      "https://www.odontonutri.com/api/admin/analytics",
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ error: "No autorizado" });
  });

  it("does not return analytics data before server verification exists", async () => {
    const response = await fetchWorker(
      new Request("https://www.odontonutri.com/api/admin/analytics", {
        headers: { Authorization: "Bearer session-placeholder" },
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      status: "pending",
      message: "Analíticas pendientes de conexión",
    });
  });

  it("returns the approximate city from Cloudflare without storing an IP", async () => {
    const response = await fetchWorker("https://www.odontonutri.com/api/geo");

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=300");
    await expect(response.json()).resolves.toEqual({ city: null });
  });

  it("uses the Cloudflare city when present", async () => {
    const request = new Request("https://www.odontonutri.com/api/geo");
    Object.defineProperty(request, "cf", {
      value: { city: "San Miguel" },
    });

    const response = await fetchWorker(request);
    await expect(response.json()).resolves.toEqual({ city: "San Miguel" });
  });
});
