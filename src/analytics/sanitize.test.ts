import { describe, expect, it } from "vitest";
import {
  approxCity,
  approxCountry,
  approxRegion,
  deviceType,
  displayTrafficName,
  eventTypeFromHref,
  formatApproxLocation,
  inAppSocialHost,
  publicPath,
  referrerHost,
  utmSourceHost,
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

  it("reads utm_source and Instagram in-app traffic without storing full URLs", () => {
    expect(utmSourceHost("?utm_source=instagram&utm_medium=social")).toBe(
      "instagram.com",
    );
    expect(utmSourceHost("utm_source=IG")).toBe("instagram.com");
    expect(utmSourceHost("?utm_source=https://evil.example")).toBeNull();
    expect(inAppSocialHost("Mozilla/5.0 Instagram 360.0.0.33.106")).toBe(
      "instagram.com",
    );
    expect(inAppSocialHost("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBeNull();
    expect(displayTrafficName("instagram.com")).toBe("Instagram");
    expect(displayTrafficName(null)).toBe("Directo");
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

  it("keeps an approximate city name without URLs or IPs", () => {
    expect(approxCity("San Miguel")).toBe("San Miguel");
    expect(approxCity("  Buenos Aires  ")).toBe("Buenos Aires");
    expect(approxCity("https://evil.example")).toBeNull();
    expect(approxCity("a")).toBeNull();
    expect(approxCity(12)).toBeNull();
    expect(approxRegion("Buenos Aires")).toBe("Buenos Aires");
    expect(approxRegion("https://evil.example")).toBeNull();
    expect(approxCountry("AR")).toBe("AR");
    expect(approxCountry("ar")).toBe("AR");
    expect(approxCountry("XX")).toBeNull();
    expect(approxCountry("Argentina")).toBeNull();
    expect(formatApproxLocation("San Miguel", "Buenos Aires", "AR")).toBe(
      "San Miguel, Buenos Aires",
    );
    expect(formatApproxLocation("Bella Vista", "Buenos Aires", "AR")).toBe(
      "Bella Vista, Buenos Aires",
    );
    expect(formatApproxLocation("Buenos Aires", "CABA", "AR")).toBe(
      "Buenos Aires, CABA",
    );
    expect(formatApproxLocation(null, null, null)).toBeNull();
    expect(formatApproxLocation(null, null, "AR")).toBe("Argentina");
  });
});
