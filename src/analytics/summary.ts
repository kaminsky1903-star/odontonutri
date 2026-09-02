import {
  type AnalyticsSnapshot,
  type DeviceStat,
  type HourStat,
  type PageViewStat,
  type RecentActivity,
  type TrafficSource,
} from "../admin/analyticsTypes";
import { CLINIC_TIME_ZONE } from "../site";
import { displayTrafficName, formatApproxLocation } from "./sanitize";
import type { AnalyticsEvent } from "./types";

const READY_MESSAGE = "Visitas y clics del sitio, últimos 30 días.";
const PAGE_TITLES: Record<string, string> = {
  "/": "Inicio",
  "/odontologia": "Odontología",
  "/nutricion": "Nutrición",
};
const CONVERSION_PAGES = ["/", "/odontologia", "/nutricion"] as const;
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

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function since(now: Date, ms: number) {
  return new Date(now.getTime() - ms);
}

function startOfLocalDay(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfLocalMonth(now: Date) {
  const start = startOfLocalDay(now);
  start.setDate(1);
  return start;
}

function startOfPreviousLocalMonth(now: Date) {
  const start = startOfLocalMonth(now);
  start.setMonth(start.getMonth() - 1);
  return start;
}

export function analyticsQueryStart(now = new Date()) {
  const thirtyDaysAgo = since(now, THIRTY_DAYS_MS);
  const lastMonthStart = startOfPreviousLocalMonth(now);
  return lastMonthStart.getTime() <= thirtyDaysAgo.getTime()
    ? lastMonthStart
    : thirtyDaysAgo;
}

function inWindow(event: AnalyticsEvent, start: Date, end: Date) {
  const time = new Date(event.created_at).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function inHalfOpenWindow(event: AnalyticsEvent, start: Date, endExclusive: Date) {
  const time = new Date(event.created_at).getTime();
  return time >= start.getTime() && time < endExclusive.getTime();
}

function dailyVisits(events: AnalyticsEvent[], now: Date) {
  const today = startOfLocalDay(now);
  const points = [];
  for (let offset = 29; offset >= 0; offset -= 1) {
    const start = new Date(today);
    start.setDate(start.getDate() - offset);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const value = uniqueSessions(
      events.filter(
        (event) =>
          event.event_type === "visit" && inHalfOpenWindow(event, start, end),
      ),
    ).size;
    points.push({ date: start.toISOString(), value });
  }
  return points;
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
    const name = displayTrafficName(event.referrer_host);
    const sessions = counts.get(name) ?? new Set<string>();
    sessions.add(event.session_id);
    counts.set(name, sessions);
  }
  const total = [...counts.values()].reduce(
    (sum, sessions) => sum + sessions.size,
    0,
  );
  return [...counts.entries()]
    .map(([name, sessions]) => ({
      name,
      sessions: sessions.size,
      percent: percent(sessions.size, total),
    }))
    .sort((a, b) => (b.sessions ?? 0) - (a.sessions ?? 0))
    .slice(0, 8);
}

function percent(part: number, total: number): number | null {
  if (total <= 0) {
    return null;
  }
  return Math.round((part / total) * 100);
}

function visitorKey(event: AnalyticsEvent) {
  return event.visitor_id || event.session_id || null;
}

export function formatVisitorLabel(id: string) {
  const compact = id.replace(/-/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (compact.length >= 8) {
    return `V-${compact.slice(0, 8)}`;
  }
  return compact;
}

function visitorLabel(id: string) {
  return formatVisitorLabel(id);
}

function visitCountsByVisitor(events: AnalyticsEvent[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.event_type !== "visit") {
      continue;
    }
    const key = visitorKey(event);
    if (!key) {
      continue;
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function topPages(events: AnalyticsEvent[]): PageViewStat[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const event of events) {
    if (event.event_type !== "page_view") {
      continue;
    }
    counts.set(event.path, (counts.get(event.path) ?? 0) + 1);
    total += 1;
  }
  return [...counts.entries()]
    .map(([path, views]) => ({
      path,
      title: pageTitle(path),
      views,
      percent: percent(views, total),
    }))
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 8);
}

function conversionsByPage(events: AnalyticsEvent[]): PageViewStat[] {
  const counts = new Map<string, number>();
  for (const path of CONVERSION_PAGES) {
    counts.set(path, 0);
  }
  let total = 0;
  for (const event of events) {
    if (!CONTACT_TYPES.has(event.event_type)) {
      continue;
    }
    counts.set(event.path, (counts.get(event.path) ?? 0) + 1);
    total += 1;
  }
  if (total === 0) {
    return [];
  }
  return [...counts.entries()]
    .map(([path, views]) => ({
      path,
      title: pageTitle(path),
      views,
      percent: percent(views, total),
    }))
    .sort((a, b) => {
      const byViews = (b.views ?? 0) - (a.views ?? 0);
      if (byViews !== 0) {
        return byViews;
      }
      return conversionPageRank(a.path) - conversionPageRank(b.path);
    });
}

function conversionPageRank(path: string) {
  const index = (CONVERSION_PAGES as readonly string[]).indexOf(path);
  return index === -1 ? CONVERSION_PAGES.length : index;
}

const WHATSAPP_HOUR_START = 9;
const WHATSAPP_HOUR_END = 18;

function clinicHour(iso: string) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    hour: "numeric",
    hourCycle: "h23",
  })
    .formatToParts(new Date(iso))
    .find((part) => part.type === "hour")?.value;
  const parsed = Number(hour);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 23 ? parsed : 0;
}

function whatsappHours(events: AnalyticsEvent[]): HourStat[] {
  const values: HourStat[] = [];
  for (let hour = WHATSAPP_HOUR_START; hour <= WHATSAPP_HOUR_END; hour += 1) {
    values.push({ hour, value: 0 });
  }
  for (const event of events) {
    if (event.event_type !== "whatsapp_click") {
      continue;
    }
    const hour = clinicHour(event.created_at);
    if (hour < WHATSAPP_HOUR_START || hour > WHATSAPP_HOUR_END) {
      continue;
    }
    values[hour - WHATSAPP_HOUR_START].value += 1;
  }
  return values;
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
  const total = [...counts.values()].reduce(
    (sum, sessions) => sum + sessions.size,
    0,
  );
  return [...counts.entries()]
    .map(([type, sessions]) => ({
      type: type as DeviceStat["type"],
      label: DEVICE_LABELS[type],
      visitors: sessions.size,
      percent: percent(sessions.size, total),
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
      current.source = displayTrafficName(event.referrer_host);
    } else if (event.referrer_host && current.source === "Directo") {
      current.source = displayTrafficName(event.referrer_host);
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

function recentActivity(
  events: AnalyticsEvent[],
  now: Date,
): RecentActivity[] {
  const monthStart = since(now, THIRTY_DAYS_MS);
  const scoped = events.filter((event) => inWindow(event, monthStart, now));
  const context = sessionContext(scoped);
  const visits = visitCountsByVisitor(scoped);
  return scoped
    .filter(
      (event) =>
        event.event_type === "visit" || CONTACT_TYPES.has(event.event_type),
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
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
      const key = visitorKey(event);
      const eventSource = displayTrafficName(event.referrer_host);
      return {
        id: `${event.created_at}-${event.event_type}-${event.session_id ?? index}`,
        at: event.created_at,
        action: ACTION_LABELS[event.event_type] ?? event.event_type,
        page: pageTitle(event.path),
        source: eventSource !== "Directo" ? eventSource : session?.source || "Directo",
        device:
          (event.device_type && DEVICE_LABELS[event.device_type]) ||
          session?.device ||
          "Escritorio",
        isContact,
        landing: journey.landing,
        pages: journey.pages,
        durationMinutes: journey.durationMinutes,
        visitorId: key,
        visitorLabel: key ? visitorLabel(key) : null,
        visitCount: key ? (visits.get(key) ?? 0) : 0,
        location: formatApproxLocation(event.city, event.region, event.country),
        city: event.city,
      };
    });
}

export function withoutIgnoredVisitors(
  events: AnalyticsEvent[],
  ignored: Iterable<string>,
) {
  const skip = new Set(ignored);
  if (skip.size === 0) {
    return events;
  }
  return events.filter((event) => {
    const key = event.visitor_id || event.session_id;
    return !key || !skip.has(key);
  });
}

export function summarizeAnalyticsEvents(
  events: AnalyticsEvent[],
  now = new Date(),
): AnalyticsSnapshot {
  const day = startOfLocalDay(now);
  const week = since(now, 7 * 24 * 60 * 60 * 1000);
  const month = since(now, THIRTY_DAYS_MS);
  const lastMonthStart = startOfPreviousLocalMonth(now);
  const thisMonthStart = startOfLocalMonth(now);
  const activeWindow = since(now, 5 * 60 * 1000);
  const todayEvents = events.filter((event) => inWindow(event, day, now));
  const weekEvents = events.filter((event) => inWindow(event, week, now));
  const monthEvents = events.filter((event) => inWindow(event, month, now));
  const lastMonthEvents = events.filter((event) =>
    inHalfOpenWindow(event, lastMonthStart, thisMonthStart),
  );
  const activeEvents = events.filter((event) =>
    inWindow(event, activeWindow, now),
  );
  const visitors = uniqueSessions(monthEvents);
  const converted = uniqueSessions(
    monthEvents.filter((event) => CONTACT_TYPES.has(event.event_type)),
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
    whatsappClicksToday: countType(todayEvents, "whatsapp_click"),
    whatsappClicksLast7Days: countType(weekEvents, "whatsapp_click"),
    whatsappClicksLastMonth: countType(lastMonthEvents, "whatsapp_click"),
    phoneClicks: countType(events, "phone_click"),
    locationClicks: countType(events, "location_click"),
    conversionRate,
    dailyVisits: dailyVisits(events, now),
    conversionsByPage: conversionsByPage(monthEvents),
    whatsappHours: whatsappHours(monthEvents),
    trafficSources: topTraffic(events),
    topPages: topPages(events),
    devices: deviceStats(events),
    recentActivity: recentActivity(events, now),
  };
}

export type VisitorActivityRange = "today" | "7d" | "month";

export function visitorRangeStart(
  range: VisitorActivityRange,
  now = new Date(),
) {
  if (range === "today") {
    return startOfLocalDay(now);
  }
  if (range === "7d") {
    return since(now, 7 * 24 * 60 * 60 * 1000);
  }
  return since(now, THIRTY_DAYS_MS);
}

export function filterActivityByRange(
  items: RecentActivity[],
  range: VisitorActivityRange,
  now = new Date(),
) {
  const start = visitorRangeStart(range, now).getTime();
  const end = now.getTime();
  return items.filter((item) => {
    const time = new Date(item.at).getTime();
    return time >= start && time <= end;
  });
}

export function visitorsForRange(
  snapshot: {
    visitorsToday: number | null;
    visitorsLast7Days: number | null;
    visitorsLast30Days: number | null;
  },
  range: VisitorActivityRange,
) {
  if (range === "today") {
    return snapshot.visitorsToday;
  }
  if (range === "7d") {
    return snapshot.visitorsLast7Days;
  }
  return snapshot.visitorsLast30Days;
}

export { READY_MESSAGE };
