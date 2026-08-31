import {
  type AnalyticsSnapshot,
  type DeviceStat,
  type PageViewStat,
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
      title: PAGE_TITLES[path] ?? path,
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
  };
}

export { READY_MESSAGE };
