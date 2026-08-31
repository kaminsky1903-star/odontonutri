import { describe, expect, it } from "vitest";
import worker from "./index";

const fetchWorker = (input: string | Request) =>
  (worker.fetch as (request: Request) => Promise<Response>)(
    typeof input === "string" ? new Request(input) : input,
  );

describe("worker", () => {
  it("redirects the apex domain to www", async () => {
    const response = await fetchWorker("https://odontonutri.com/visita?utm=ig");

    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(
      "https://www.odontonutri.com/visita?utm=ig",
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

  it("leaves non-API routes to the asset handler", async () => {
    const response = await fetchWorker("https://www.odontonutri.com/");

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
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
});
