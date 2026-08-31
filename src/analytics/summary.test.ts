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
        created_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
        event_type: "visit",
        session_id: "s1",
        referrer_host: "instagram.com",
      }),
      event({
        created_at: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
        event_type: "page_view",
        session_id: "s1",
        path: "/",
      }),
      event({
        created_at: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
        event_type: "whatsapp_click",
        session_id: "s1",
      }),
      event({
        created_at: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
        event_type: "visit",
        session_id: "s2",
        path: "/nutricion",
        device_type: "mobile",
      }),
      event({
        created_at: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
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
    expect(snapshot.recentActivity.map((item) => item.action)).toEqual([
      "Teléfono",
      "Visita",
      "WhatsApp",
      "Visita",
    ]);
    expect(snapshot.recentActivity[0]).toMatchObject({
      action: "Teléfono",
      page: "Nutrición",
      source: "Directo",
      device: "Celular",
      isContact: true,
      landing: "Nutrición",
      pages: ["Nutrición"],
      durationMinutes: 2,
    });
    expect(snapshot.recentActivity[1]).toMatchObject({
      action: "Visita",
      isContact: false,
      landing: null,
      pages: [],
      durationMinutes: null,
    });
    expect(snapshot.recentActivity[2]).toMatchObject({
      action: "WhatsApp",
      page: "Inicio",
      source: "instagram.com",
      device: "Escritorio",
      isContact: true,
      landing: "Inicio",
      pages: ["Inicio"],
      durationMinutes: 1,
    });
  });

  it("builds the page journey under each contact", () => {
    const events: AnalyticsEvent[] = [
      event({
        created_at: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        event_type: "visit",
        session_id: "s3",
        path: "/",
        referrer_host: "google.com",
      }),
      event({
        created_at: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        event_type: "page_view",
        session_id: "s3",
        path: "/",
      }),
      event({
        created_at: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
        event_type: "page_view",
        session_id: "s3",
        path: "/odontologia",
      }),
      event({
        created_at: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
        event_type: "page_view",
        session_id: "s3",
        path: "/nutricion",
      }),
      event({
        created_at: now.toISOString(),
        event_type: "whatsapp_click",
        session_id: "s3",
        path: "/nutricion",
      }),
    ];

    const snapshot = summarizeAnalyticsEvents(events, now);
    const contact = snapshot.recentActivity.find(
      (item) => item.action === "WhatsApp",
    );

    expect(contact).toMatchObject({
      page: "Nutrición",
      isContact: true,
      landing: "Inicio",
      pages: ["Inicio", "Odontología", "Nutrición"],
      durationMinutes: 12,
    });
  });
});
