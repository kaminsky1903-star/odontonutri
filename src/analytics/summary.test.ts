import { describe, expect, it } from "vitest";
import { summarizeAnalyticsEvents } from "./summary";
import type { AnalyticsEvent } from "./types";

const now = new Date("2026-08-31T15:00:00-03:00");

function event(
  partial: Partial<AnalyticsEvent> & Pick<AnalyticsEvent, "event_type" | "session_id">,
): AnalyticsEvent {
  return {
    created_at: now.toISOString(),
    path: "/",
    referrer_host: null,
    device_type: "desktop",
    ...partial,
  };
}

describe("analytics summary", () => {
  it("counts unique visitors, live sessions, clicks and conversion", () => {
    const events: AnalyticsEvent[] = [
      event({
        event_type: "visit",
        session_id: "s1",
        referrer_host: "instagram.com",
      }),
      event({ event_type: "page_view", session_id: "s1", path: "/" }),
      event({ event_type: "whatsapp_click", session_id: "s1" }),
      event({
        event_type: "visit",
        session_id: "s2",
        path: "/nutricion",
        device_type: "mobile",
      }),
      event({
        event_type: "page_view",
        session_id: "s2",
        path: "/nutricion",
        device_type: "mobile",
      }),
      event({
        event_type: "phone_click",
        session_id: "s2",
        path: "/nutricion",
        device_type: "mobile",
      }),
    ];

    const snapshot = summarizeAnalyticsEvents(events, now);

    expect(snapshot.status).toBe("ready");
    expect(snapshot.visitorsToday).toBe(2);
    expect(snapshot.visitorsLast7Days).toBe(2);
    expect(snapshot.visitorsLast30Days).toBe(2);
    expect(snapshot.activeNow).toBe(2);
    expect(snapshot.whatsappClicks).toBe(1);
    expect(snapshot.phoneClicks).toBe(1);
    expect(snapshot.locationClicks).toBe(0);
    expect(snapshot.conversionRate).toBe(100);
    expect(snapshot.trafficSources).toEqual([
      { name: "instagram.com", sessions: 1 },
      { name: "Directo", sessions: 1 },
    ]);
    expect(snapshot.topPages.map((page) => page.path)).toEqual([
      "/",
      "/nutricion",
    ]);
    expect(snapshot.cities).toEqual([]);
    expect(snapshot.devices).toEqual([
      { type: "desktop", label: "Escritorio", visitors: 1 },
      { type: "mobile", label: "Celular", visitors: 1 },
    ]);
  });
});
