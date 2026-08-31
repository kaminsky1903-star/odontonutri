import {
  type AnalyticsSnapshot,
  type DeviceStat,
  type PageViewStat,
  type RecentActivity,
  type TrafficSource,
} from "../admin/analyticsTypes";
import type { AnalyticsEvent } from "./types";

const READY_MESSAGE = "Visitas y clics del sitio, últimos 30 días.";
const PAGE_TITLES: Record<string, string> = {
  "/": "Inicio",
  "/odontologia": "Odontología",
  "/nutricion": "Nutrición",
};
const DEVICE_LABELS: Record<string, string> = {
  desktop: "Escritorio",
  mobile: "Celular",
  tablet: "Tablet",
};
const CONTACT_TYPES = new Set([
  "whatsapp_click",
  "phone_click",
  "location_click",
]);
const ACTION_LABELS: Record<string, string> = {
  visit: "Visita",
  whatsapp_click: "WhatsApp",
  phone_click: "Teléfono",
  location_click: "Ubicación",
};

function pageTitle(path: string) {
  return PAGE_TITLES[path] ?? path;
}

function uniqueSessions(events: AnalyticsEvent[]) {
  const sessions = new Set<string>();
  for (const event of events) {
    if (event.session_id) {
      sessions.add(event.session_id);
    }
  }
  return sessions;
}

function since(now: Date, ms: number) {
  return new Date(now.getTime() - ms);
}

function startOfLocalDay(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
}

function inWindow(event: AnalyticsEvent, start: Date, now: Date) {
  const time = new Date(event.created_at).getTime();
  return time >= start.getTime() && time <= now.getTime();
}

function countType(events: AnalyticsEvent[], type: string) {
  return events.filter((event) => event.event_type === type).length;
}

function topTraffic(events: AnalyticsEvent[]): TrafficSource[] {
  const counts = new Map<string, Set<string>>();
  for (const event of events) {
    if (event.event_type !== "visit" || !event.session_id) {
      continue;
    }
    const name = event.referrer_host || "Directo";
    const sessions = counts.get(name) ?? new Set<string>();
    sessions.add(event.session_id);
    counts.set(name, sessions);
  }
  return [...counts.entries()]
    .map(([name, sessions]) => ({ name, sessions: sessions.size }))
    .sort((a, b) => (b.sessions ?? 0) - (a.sessions ?? 0))
    .slice(0, 8);
}

function topPages(events: AnalyticsEvent[]): PageViewStat[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.event_type !== "page_view") {
      continue;
    }
    counts.set(event.path, (counts.get(event.path) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([path, views]) => ({
      path,
      title: pageTitle(path),
      views,
    }))
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 8);
}

function deviceStats(events: AnalyticsEvent[]): DeviceStat[] {
  const counts = new Map<string, Set<string>>();
  for (const event of events) {
    if (!event.session_id || !event.device_type) {
      continue;
    }
    if (!DEVICE_LABELS[event.device_type]) {
      continue;
    }
    const sessions = counts.get(event.device_type) ?? new Set<string>();
    sessions.add(event.session_id);
    counts.set(event.device_type, sessions);
  }
  return [...counts.entries()]
    .map(([type, sessions]) => ({
      type: type as DeviceStat["type"],
      label: DEVICE_LABELS[type],
      visitors: sessions.size,
    }))
    .sort((a, b) => (b.visitors ?? 0) - (a.visitors ?? 0));
}

function sessionContext(events: AnalyticsEvent[]) {
  const context = new Map<string, { source: string; device: string }>();
  for (const event of events) {
    if (!event.session_id) {
      continue;
    }
    const current = context.get(event.session_id) ?? {
      source: "Directo",
      device: "Escritorio",
    };
    if (event.event_type === "visit") {
      current.source = event.referrer_host || "Directo";
    } else if (event.referrer_host && current.source === "Directo") {
      current.source = event.referrer_host;
    }
    if (event.device_type && DEVICE_LABELS[event.device_type]) {
      current.device = DEVICE_LABELS[event.device_type];
    }
    context.set(event.session_id, current);
  }
  return context;
}

function uniqueConsecutivePages(events: AnalyticsEvent[]) {
  const pages: string[] = [];
  for (const event of events) {
    if (event.event_type !== "visit" && event.event_type !== "page_view") {
      continue;
    }
    const title = pageTitle(event.path);
    if (pages[pages.length - 1] !== title) {
      pages.push(title);
    }
  }
  return pages;
}

function contactJourney(events: AnalyticsEvent[], contact: AnalyticsEvent) {
  if (!contact.session_id) {
    return {
      landing: pageTitle(contact.path),
      pages: [pageTitle(contact.path)],
      durationMinutes: null as number | null,
    };
  }

  const contactTime = new Date(contact.created_at).getTime();
  const sessionEvents = events
    .filter(
      (event) =>
        event.session_id === contact.session_id &&
        new Date(event.created_at).getTime() <= contactTime,
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  const pages = uniqueConsecutivePages(sessionEvents);
  const first = sessionEvents[0];
  const durationMinutes = first
    ? Math.max(
        0,
        Math.round(
          (contactTime - new Date(first.created_at).getTime()) / 60000,
        ),
      )
    : null;

  return {
    landing: pages[0] ?? pageTitle(contact.path),
    pages: pages.length > 0 ? pages : [pageTitle(contact.path)],
    durationMinutes,
  };
}

function recentActivity(events: AnalyticsEvent[]): RecentActivity[] {
  const context = sessionContext(events);
  return events
    .filter(
      (event) =>
        event.event_type === "visit" || CONTACT_TYPES.has(event.event_type),
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 25)
    .map((event, index) => {
      const session = event.session_id
        ? context.get(event.session_id)
        : undefined;
      const isContact = CONTACT_TYPES.has(event.event_type);
      const journey = isContact
        ? contactJourney(events, event)
        : {
            landing: null,
            pages: [] as string[],
            durationMinutes: null,
          };
      return {
        id: `${event.created_at}-${event.event_type}-${event.session_id ?? index}`,
        at: event.created_at,
        action: ACTION_LABELS[event.event_type] ?? event.event_type,
        page: pageTitle(event.path),
        source: event.referrer_host || session?.source || "Directo",
        device:
          (event.device_type && DEVICE_LABELS[event.device_type]) ||
          session?.device ||
          "Escritorio",
        isContact,
        landing: journey.landing,
        pages: journey.pages,
        durationMinutes: journey.durationMinutes,
      };
    });
}

export function summarizeAnalyticsEvents(
  events: AnalyticsEvent[],
  now = new Date(),
): AnalyticsSnapshot {
  const day = startOfLocalDay(now);
  const week = since(now, 7 * 24 * 60 * 60 * 1000);
  const activeWindow = since(now, 5 * 60 * 1000);
  const todayEvents = events.filter((event) => inWindow(event, day, now));
  const weekEvents = events.filter((event) => inWindow(event, week, now));
  const activeEvents = events.filter((event) =>
    inWindow(event, activeWindow, now),
  );
  const visitors = uniqueSessions(events);
  const converted = uniqueSessions(
    events.filter((event) => CONTACT_TYPES.has(event.event_type)),
  );
  const conversionRate =
    visitors.size === 0
      ? null
      : Math.round((converted.size / visitors.size) * 100);

  return {
    status: "ready",
    message: READY_MESSAGE,
    visitorsToday: uniqueSessions(todayEvents).size,
    visitorsLast7Days: uniqueSessions(weekEvents).size,
    visitorsLast30Days: visitors.size,
    activeNow: uniqueSessions(activeEvents).size,
    whatsappClicks: countType(events, "whatsapp_click"),
    phoneClicks: countType(events, "phone_click"),
    locationClicks: countType(events, "location_click"),
    conversionRate,
    trafficSources: topTraffic(events),
    topPages: topPages(events),
    cities: [],
    devices: deviceStats(events),
    recentActivity: recentActivity(events),
  };
}

export { READY_MESSAGE };
