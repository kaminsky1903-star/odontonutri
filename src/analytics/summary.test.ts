import { describe, expect, it } from "vitest";
import {
  analyticsQueryStart,
  filterActivityByRange,
  formatVisitorLabel,
  summarizeAnalyticsEvents,
  withoutIgnoredVisitors,
} from "./summary";
import type { AnalyticsEvent } from "./types";

const now = new Date("2026-08-31T15:00:00-03:00");

function event(
  partial: Partial<AnalyticsEvent> & Pick<AnalyticsEvent, "event_type" | "session_id">,
): AnalyticsEvent {
  return {
    created_at: now.toISOString(),
    path: "/",
    visitor_id: null,
    referrer_host: null,
    device_type: "desktop",
    city: null,
    region: null,
    country: null,
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
    expect(snapshot.whatsappClicksToday).toBe(1);
    expect(snapshot.whatsappClicksLast7Days).toBe(1);
    expect(snapshot.whatsappClicksLastMonth).toBe(0);
    expect(snapshot.phoneClicks).toBe(1);
    expect(snapshot.locationClicks).toBe(0);
    expect(snapshot.conversionRate).toBe(100);
    expect(snapshot.dailyVisits).toHaveLength(30);
    expect(snapshot.dailyVisits.at(-1)?.value).toBe(2);
    expect(snapshot.dailyVisits.slice(0, 29).every((point) => point.value === 0)).toBe(
      true,
    );
    expect(snapshot.trafficSources).toEqual([
      { name: "Instagram", sessions: 1, percent: 50 },
      { name: "Directo", sessions: 1, percent: 50 },
    ]);
    expect(snapshot.conversionsByPage).toEqual([
      { path: "/", title: "Inicio", views: 1, percent: 50 },
      { path: "/nutricion", title: "Nutrición", views: 1, percent: 50 },
      { path: "/odontologia", title: "Odontología", views: 0, percent: 0 },
    ]);
    expect(snapshot.whatsappHours.map((item) => item.hour)).toEqual([
      9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
    ]);
    expect(snapshot.whatsappHours.find((item) => item.hour === 14)?.value).toBe(
      1,
    );
    expect(
      snapshot.whatsappHours.filter((item) => item.value > 0),
    ).toHaveLength(1);
    expect(snapshot.topPages).toEqual([
      { path: "/", title: "Inicio", views: 1, percent: 50 },
      { path: "/nutricion", title: "Nutrición", views: 1, percent: 50 },
    ]);
    expect(snapshot.devices).toEqual([
      { type: "desktop", label: "Escritorio", visitors: 1, percent: 50 },
      { type: "mobile", label: "Celular", visitors: 1, percent: 50 },
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
      visitorId: "s2",
      visitorLabel: "S2",
      visitCount: 1,
      city: null,
    });
    expect(snapshot.recentActivity[1]).toMatchObject({
      action: "Visita",
      isContact: false,
      landing: null,
      pages: [],
      durationMinutes: null,
      visitorLabel: "S2",
      visitCount: 1,
      city: null,
    });
    expect(snapshot.recentActivity[2]).toMatchObject({
      action: "WhatsApp",
      page: "Inicio",
      source: "Instagram",
      device: "Escritorio",
      isContact: true,
      landing: "Inicio",
      pages: ["Inicio"],
      durationMinutes: 1,
      visitorLabel: "S1",
      visitCount: 1,
      city: null,
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

  it("splits WhatsApp clicks into today, last 7 days and last calendar month", () => {
    const lastMonth = new Date(now);
    lastMonth.setDate(1);
    lastMonth.setHours(12, 0, 0, 0);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const events: AnalyticsEvent[] = [
      event({
        created_at: now.toISOString(),
        event_type: "whatsapp_click",
        session_id: "w-today",
      }),
      event({
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        event_type: "whatsapp_click",
        session_id: "w-week",
      }),
      event({
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        event_type: "whatsapp_click",
        session_id: "w-older",
      }),
      event({
        created_at: lastMonth.toISOString(),
        event_type: "whatsapp_click",
        session_id: "w-last-month",
      }),
    ];

    const snapshot = summarizeAnalyticsEvents(events, now);

    expect(snapshot.whatsappClicksToday).toBe(1);
    expect(snapshot.whatsappClicksLast7Days).toBe(2);
    expect(snapshot.whatsappClicksLastMonth).toBe(1);
  });

  it("only counts WhatsApp hours from 9 to 18", () => {
    const snapshot = summarizeAnalyticsEvents(
      [
        event({
          created_at: "2026-08-30T08:30:00-03:00",
          event_type: "whatsapp_click",
          session_id: "early",
        }),
        event({
          created_at: "2026-08-31T11:00:00-03:00",
          event_type: "whatsapp_click",
          session_id: "mid",
        }),
        event({
          created_at: "2026-08-30T21:00:00-03:00",
          event_type: "whatsapp_click",
          session_id: "late",
        }),
      ],
      now,
    );

    expect(snapshot.whatsappHours.find((item) => item.hour === 11)?.value).toBe(
      1,
    );
    expect(
      snapshot.whatsappHours.filter((item) => item.value > 0).map((item) => item.hour),
    ).toEqual([11]);
  });

  it("always lists Nutrición among conversion pages", () => {
    const snapshot = summarizeAnalyticsEvents(
      [
        event({
          event_type: "whatsapp_click",
          session_id: "w-odonto",
          path: "/odontologia",
        }),
      ],
      now,
    );

    expect(snapshot.conversionsByPage).toEqual([
      { path: "/odontologia", title: "Odontología", views: 1, percent: 100 },
      { path: "/", title: "Inicio", views: 0, percent: 0 },
      { path: "/nutricion", title: "Nutrición", views: 0, percent: 0 },
    ]);
  });

  it("starts the analytics query at the previous calendar month", () => {
    const start = analyticsQueryStart(now);
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe((now.getMonth() + 11) % 12);
    expect(start.getHours()).toBe(0);
  });

  it("summarizes approximate cities and returning visitors", () => {
    const visitor = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeffff";
    const events: AnalyticsEvent[] = [
      event({
        created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        event_type: "visit",
        session_id: "s-first",
        visitor_id: visitor,
        city: "San Miguel",
      }),
      event({
        created_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        event_type: "visit",
        session_id: "s-return",
        visitor_id: visitor,
        city: "San Miguel",
      }),
      event({
        event_type: "visit",
        session_id: "s-other",
        visitor_id: "11111111-2222-4333-8444-555555555555",
        city: "Buenos Aires",
      }),
    ];

    const snapshot = summarizeAnalyticsEvents(events, now);
    const returning = snapshot.recentActivity.filter(
      (item) => item.visitorLabel === "V-AAAAAAAA",
    );
    expect(returning.length).toBe(2);
    expect(returning.every((item) => item.visitCount === 2)).toBe(true);
    expect(returning.every((item) => item.location === "San Miguel")).toBe(true);
    expect(returning.every((item) => item.city === "San Miguel")).toBe(true);
  });

  it("keeps the same visitor code on a later WhatsApp click and formats location", () => {
    const visitor = "f95f2a6c-1111-4222-8333-444444444444";
    const snapshot = summarizeAnalyticsEvents(
      [
        event({
          created_at: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
          event_type: "visit",
          session_id: "s-same",
          visitor_id: visitor,
          city: "Bella Vista",
          region: "Buenos Aires",
          country: "AR",
        }),
        event({
          created_at: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
          event_type: "page_view",
          session_id: "s-same",
          visitor_id: visitor,
          path: "/",
        }),
        event({
          event_type: "whatsapp_click",
          session_id: "s-same",
          visitor_id: visitor,
          city: "Bella Vista",
          region: "Buenos Aires",
          country: "AR",
        }),
      ],
      now,
    );

    expect(formatVisitorLabel(visitor)).toBe("V-F95F2A6C");
    expect(snapshot.recentActivity.map((item) => item.visitorLabel)).toEqual([
      "V-F95F2A6C",
      "V-F95F2A6C",
    ]);
    expect(snapshot.recentActivity[0]?.location).toBe("Bella Vista, Buenos Aires");
    expect(snapshot.visitorsToday).toBe(1);
  });

  it("filters visitor activity to today until a longer range is requested", () => {
    const older = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const snapshot = summarizeAnalyticsEvents(
      [
        event({
          event_type: "visit",
          session_id: "s-today",
        }),
        event({
          created_at: older,
          event_type: "visit",
          session_id: "s-week",
        }),
      ],
      now,
    );

    expect(filterActivityByRange(snapshot.recentActivity, "today", now)).toHaveLength(
      1,
    );
    expect(filterActivityByRange(snapshot.recentActivity, "7d", now)).toHaveLength(
      2,
    );
    expect(
      filterActivityByRange(snapshot.recentActivity, "month", now),
    ).toHaveLength(2);
  });

  it("drops ignored clinic devices before summarizing", () => {
    const events: AnalyticsEvent[] = [
      event({
        event_type: "visit",
        session_id: "s-clinic",
        visitor_id: "clinic-device",
      }),
      event({
        event_type: "visit",
        session_id: "s-patient",
        visitor_id: "patient-device",
      }),
    ];

    const snapshot = summarizeAnalyticsEvents(
      withoutIgnoredVisitors(events, ["clinic-device"]),
      now,
    );
    expect(snapshot.visitorsToday).toBe(1);
    expect(snapshot.recentActivity).toHaveLength(1);
    expect(snapshot.recentActivity[0]?.visitorId).toBe("patient-device");
  });
});
