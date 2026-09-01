import { describe, expect, it } from "vitest";
import worker from "./index";

type WorkerEnv = {
  ASSETS?: Fetcher;
};

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

function assetsEnv(body = "<html>spa</html>") {
  return {
    ASSETS: {
      fetch: async () =>
        new Response(body, {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
    },
  } as unknown as WorkerEnv;
}

describe("worker", () => {
  it("redirects the apex domain to https www", async () => {
    const response = await fetchWorker("https://odontonutri.com/visita?utm=ig");

    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(
      "https://www.odontonutri.com/visita?utm=ig",
    );
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

  it("serves public HTML routes from assets without a navigate header", async () => {
    const env = assetsEnv();
    const odontologia = await fetchWorker(
      "https://www.odontonutri.com/odontologia",
      env,
    );
    const nutricion = await fetchWorker(
      "https://www.odontonutri.com/nutricion",
      env,
    );

    expect(odontologia.status).toBe(200);
    expect(nutricion.status).toBe(200);
    expect(odontologia.headers.get("content-type")).toMatch(/html/);
    expect(await odontologia.text()).toBe("<html>spa</html>");
    expect(await nutricion.text()).toBe("<html>spa</html>");
  });

  it("leaves unmatched public routes to the asset handler", async () => {
    const response = await fetchWorker(
      "https://www.odontonutri.com/",
      assetsEnv(),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("<html>spa</html>");
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
