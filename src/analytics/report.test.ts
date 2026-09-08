import { describe, expect, it } from "vitest";
import { buildReport, periodBounds, type Period } from "./report";
import { attributionFromSearch, trafficChannel } from "./attribution";
import type { AnalyticsEvent } from "./types";

const now = new Date("2026-09-08T15:00:00Z");
const period: Period = { preset: "7d", from: "2026-09-01", to: "2026-09-08" };
const event = (changes: Partial<AnalyticsEvent> = {}): AnalyticsEvent => ({ created_at: "2026-09-08T10:00:00Z", event_type: "visit", path: "/", visitor_id: "v1", session_id: "s1", referrer_host: "google.com", device_type: "mobile", city: "Bella Vista", region: "Buenos Aires", country: "AR", ...changes });

describe("period metrics", () => {
  it("deduplicates repeated contacts and returning visitors across sessions and days", () => {
    const result = buildReport([
      event(), event({ event_type: "whatsapp_click" }), event({ event_type: "whatsapp_click" }),
      event({ session_id: "s2", created_at: "2026-09-07T10:00:00Z" }),
      event({ visitor_id: "v2", session_id: "s3" }),
    ], period, now)!;
    expect(result).toMatchObject({ visitors: 2, sessions: 3, contacts: 1, whatsapp: 2, conversion: 50 });
    expect(result.daily.slice(-2).map(day => [day.value, day.contacts])).toEqual([[1, 0], [2, 1]]);
    expect(result.sources[0]).toMatchObject({ name: "Google · sin determinar", visitors: 2, contacts: 1, conversion: 50 });
  });

  it("uses Argentine calendar days and applies the same range to every breakdown", () => {
    const result = buildReport([
      event({ created_at: "2026-09-08T02:59:59Z", event_type: "phone_click", city: "Outside" }),
      event({ created_at: "2026-09-08T03:00:00Z" }),
      event({ created_at: "2026-09-09T03:00:00Z", event_type: "whatsapp_click" }),
    ], { ...period, preset: "today" }, now)!;
    expect(result.phone).toBe(0);
    expect(result.whatsapp).toBe(0);
    expect(result.locations.map(row => row.name)).toEqual(["Bella Vista, Buenos Aires"]);
    expect(result.daily).toHaveLength(1);
  });

  it("shows WhatsApp activity only from 8 through 22", () => {
    const result = buildReport([
      event({ created_at: "2026-09-08T10:59:00Z", event_type: "whatsapp_click" }),
      event({ created_at: "2026-09-08T11:00:00Z", event_type: "whatsapp_click" }),
      event({ created_at: "2026-09-09T01:59:00Z", event_type: "whatsapp_click" }),
      event({ created_at: "2026-09-09T02:00:00Z", event_type: "whatsapp_click" }),
    ], { ...period, preset: "today" }, new Date("2026-09-09T02:30:00Z"))!;
    expect(result.hours).toHaveLength(15);
    expect(result.hours[0]).toEqual({ hour: 8, value: 1 });
    expect(result.hours.at(-1)).toEqual({ hour: 22, value: 1 });
    expect(result.hours.reduce((sum, row) => sum + row.value, 0)).toBe(2);
  });

  it("shows null conversion for empty periods and validates custom dates", () => {
    expect(buildReport([], period, now)?.conversion).toBeNull();
    expect(periodBounds({ preset: "custom", from: "2026-02-30", to: "2026-03-02" }, now)).toBeNull();
    expect(periodBounds({ preset: "custom", from: "2026-09-09", to: "2026-09-08" }, now)).toBeNull();
    expect(periodBounds({ preset: "custom", from: "2026-09-01", to: "2026-09-09" }, now)).toBeNull();
  });

  it("uses historical session entry for contact attribution and flags legacy IDs", () => {
    const result = buildReport([
      event({ created_at: "2026-09-01T13:00:00Z", path: "/nutricion", traffic_attribution: attributionFromSearch("?utm_source=google&utm_medium=cpc&utm_campaign=Nutricion") }),
      event({ event_type: "whatsapp_click", path: "/odontologia", visitor_id: null }),
    ], period, now)!;
    expect(result.sources[0].name).toBe("Google Ads");
    expect(result.entries[0].name).toBe("Nutrición");
    expect(result.pages[0].name).toBe("Odontología");
  });

  it("uses the full custom range beyond 30 days and excludes the next Argentine day", () => {
    const result = buildReport([
      event({ created_at: "2026-07-01T03:00:00Z" }),
      event({ created_at: "2026-07-31T02:59:59Z", event_type: "whatsapp_click" }),
      event({ created_at: "2026-07-31T03:00:00Z", event_type: "phone_click" }),
    ], { preset: "custom", from: "2026-07-01", to: "2026-07-30" }, now)!;
    expect(result).toMatchObject({ visitors: 1, contacts: 1, whatsapp: 1, phone: 0, conversion: 100 });
    expect(result.daily).toHaveLength(30);
  });

  it("reconciles missing visitor IDs inside a known session", () => {
    const result = buildReport([event(), event({ visitor_id: null, event_type: "whatsapp_click" })], period, now)!;
    expect(result).toMatchObject({ visitors: 1, contacts: 1, conversion: 100, estimatedVisitors: false });
  });
});

describe("Google attribution", () => {
  it("preserves uncertainty in legacy traffic and detects new ad markers", () => {
    expect(trafficChannel(event())).toBe("Google · sin determinar");
    expect(trafficChannel(event({ traffic_attribution: attributionFromSearch("") }))).toBe("google.com");
    for (const key of ["gclid", "gbraid", "wbraid"]) {
      const data = attributionFromSearch(`?${key}=secret-click-id`);
      expect(JSON.stringify(data)).not.toContain("secret-click-id");
      expect(trafficChannel(event({ referrer_host: null, traffic_attribution: data }))).toBe("Google Ads");
    }
    expect(trafficChannel(event({ traffic_attribution: attributionFromSearch("?utm_source=google&utm_medium=cpc") }))).toBe("Google Ads");
    expect(trafficChannel(event({ traffic_attribution: attributionFromSearch("?utm_source=google") }))).toBe("Google · sin determinar");
    expect(trafficChannel(event({ referrer_host: "syndicatedsearch.goog" }))).toBe("syndicatedsearch");
    expect(trafficChannel(event({ referrer_host: "google.com.evil.test" }))).not.toContain("orgánico");
  });
});
