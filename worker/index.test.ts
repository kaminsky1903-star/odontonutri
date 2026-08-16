import { describe, expect, it } from "vitest";
import worker from "./index";

const fetchWorker = (url: string) =>
  (worker.fetch as (request: Request) => Promise<Response>)(new Request(url));

describe("worker", () => {
  it("redirects the apex domain to www", async () => {
    const response = await fetchWorker("https://odontonutri.com/visita?utm=ig");

    expect(response.status).toBe(301);
    expect(response.headers.get("Location")).toBe(
      "https://www.odontonutri.com/visita?utm=ig",
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
});
