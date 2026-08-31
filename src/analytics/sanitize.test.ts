import { describe, expect, it } from "vitest";
import {
  deviceType,
  eventTypeFromHref,
  publicPath,
  referrerHost,
} from "./sanitize";

describe("analytics sanitization", () => {
  it("keeps public paths and skips the admin area", () => {
    expect(publicPath("/nutricion")).toBe("/nutricion");
    expect(publicPath("/odontologia/")).toBe("/odontologia");
    expect(publicPath("/")).toBe("/");
    expect(publicPath("/admin")).toBeNull();
    expect(publicPath("/admin/metrics")).toBeNull();
  });

  it("stores only a referrer host, never a full URL", () => {
    expect(
      referrerHost("https://www.instagram.com/reel/abc", "www.odontonutri.com"),
    ).toBe("instagram.com");
    expect(
      referrerHost("https://www.odontonutri.com/nutricion", "www.odontonutri.com"),
    ).toBeNull();
    expect(referrerHost("", "localhost")).toBeNull();
  });

  it("classifies contact clicks without reading query values", () => {
    expect(eventTypeFromHref("/whatsapp.html?text=Hola")).toBe("whatsapp_click");
    expect(eventTypeFromHref("https://wa.link/g6wqj3")).toBe("whatsapp_click");
    expect(eventTypeFromHref("tel:+541161370040")).toBe("phone_click");
    expect(
      eventTypeFromHref("https://www.google.com/maps/search/?api=1&query=clinic"),
    ).toBe("location_click");
    expect(eventTypeFromHref("https://maps.apple.com/?q=clinic")).toBe(
      "location_click",
    );
    expect(
      eventTypeFromHref("https://www.instagram.com/odontologia.nutricion/"),
    ).toBeNull();
  });

  it("maps user agents to a coarse device type", () => {
    expect(deviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).toBe(
      "mobile",
    );
    expect(deviceType("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("tablet");
    expect(deviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(
      "desktop",
    );
  });
});
