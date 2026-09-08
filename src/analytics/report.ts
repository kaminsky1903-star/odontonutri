import { CLINIC_TIME_ZONE } from "../site";
import { trafficChannel } from "./attribution";
import type { AnalyticsEvent } from "./types";

export type Period = { preset: "today" | "7d" | "30d" | "custom"; from: string; to: string };
export type Breakdown = { name: string; visitors: number; sessions: number; contacts: number; clicks: number; conversion: number | null };
export const CONTACTS = new Set(["whatsapp_click", "phone_click", "location_click"]);
export const pageName = (path: string) => ({ "/": "Inicio", "/odontologia": "Odontología", "/nutricion": "Nutrición" })[path] ?? path;
export const visitor = (event: AnalyticsEvent) => event.visitor_id || (event.session_id ? `session:${event.session_id}` : null);
export function clinicDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: CLINIC_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const get = (type: string) => parts.find(part => part.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export const midnight = (day: string) => new Date(`${day}T00:00:00-03:00`);
export const shiftDay = (day: string, offset: number) => clinicDate(new Date(midnight(day).getTime() + offset * 86400000));
export function periodBounds(period: Period, now = new Date()) {
  const today = clinicDate(now);
  const to = period.preset === "custom" ? period.to : today;
  const from = period.preset === "custom" ? period.from : shiftDay(today, period.preset === "7d" ? -6 : period.preset === "30d" ? -29 : 0);
  if (![from, to].every(day => /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(midnight(day).getTime()) && clinicDate(midnight(day)) === day)) return null;
  const start = midnight(from).getTime();
  const end = midnight(to).getTime() + 86400000;
  if (start >= end || to > today || end - start > 366 * 86400000) return null;
  return { from, to, start, end: Math.min(end, now.getTime() + 1) };
}
const keys = (events: AnalyticsEvent[]) => new Set(events.map(visitor).filter((key): key is string => Boolean(key)));
const rate = (contacts: number, visitors: number) => visitors ? Math.round(contacts / visitors * 1000) / 10 : null;
export function buildReport(events: AnalyticsEvent[], period: Period, now = new Date()) {
  const bounds = periodBounds(period, now);
  if (!bounds) return null;
  const sessionVisitors = new Map<string, string>();
  for (const event of events) {
    if (event.session_id && event.visitor_id) sessionVisitors.set(event.session_id, event.visitor_id);
  }
  events = events.map(event => event.visitor_id || !event.session_id ? event : {
    ...event, visitor_id: sessionVisitors.get(event.session_id) ?? null,
  });
  const scoped = events.filter(event => { const time = Date.parse(event.created_at); return time >= bounds.start && time < bounds.end; });
  const contacts = scoped.filter(event => CONTACTS.has(event.event_type));
  const visitors = keys(scoped);
  const converted = keys(contacts);
  const sessions = new Set(scoped.map(event => event.session_id).filter(Boolean));
  const count = (type: string) => scoped.filter(event => event.event_type === type).length;
  // Attribute every event in a session to its earliest available entry.
  const entries = new Map<string, AnalyticsEvent>();
  for (const event of [...events].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))) {
    if (event.session_id && (event.event_type === "visit" || event.event_type === "page_view") && !entries.has(event.session_id)) entries.set(event.session_id, event);
  }
  const entry = (event: AnalyticsEvent) => event.session_id ? entries.get(event.session_id) : undefined;
  const aggregate = (group: (event: AnalyticsEvent) => string, rows = scoped): Breakdown[] => {
    const groups = new Map<string, AnalyticsEvent[]>();
    for (const event of rows) { const name = group(event); const list = groups.get(name) ?? []; list.push(event); groups.set(name, list); }
    return [...groups].map(([name, rows]) => {
      const visitors = keys(rows).size;
      const contacts = keys(rows.filter(row => CONTACTS.has(row.event_type))).size;
      return { name, visitors, sessions: new Set(rows.map(row => row.session_id).filter(Boolean)).size, contacts,
        clicks: rows.filter(row => CONTACTS.has(row.event_type)).length, conversion: rows.some(row => !visitor(row)) ? null : rate(contacts, visitors) };
    }).sort((a, b) => b.visitors - a.visitors || a.name.localeCompare(b.name));
  };
  const daily = [];
  for (let start = bounds.start; start < bounds.end; start += 86400000) {
    const rows = scoped.filter(event => Date.parse(event.created_at) >= start && Date.parse(event.created_at) < start + 86400000);
    daily.push({ date: new Date(start).toISOString(), value: keys(rows).size, contacts: keys(rows.filter(row => CONTACTS.has(row.event_type))).size });
  }
  const hourFormat = new Intl.DateTimeFormat("en-US", { timeZone: CLINIC_TIME_ZONE, hour: "numeric", hourCycle: "h23" });
  const hours = Array.from({ length: 15 }, (_, index) => {
    const hour = index + 8;
    return { hour, value: scoped.filter(event => event.event_type === "whatsapp_click" && Number(hourFormat.format(new Date(event.created_at))) === hour).length };
  });
  return { bounds, events: scoped, visitors: visitors.size, sessions: sessions.size, contacts: converted.size,
    whatsapp: count("whatsapp_click"), phone: count("phone_click"), location: count("location_click"), conversion: scoped.some(row => !visitor(row)) ? null : rate(converted.size, visitors.size), daily, hours,
    estimatedVisitors: scoped.some(event => !event.visitor_id),
    missingIdentity: scoped.some(event => !visitor(event)),
    sources: aggregate(event => trafficChannel(entry(event) ?? event)),
    campaigns: aggregate(event => (entry(event) ?? event).traffic_attribution?.campaign || "Sin campaña registrada"),
    entries: aggregate(event => entry(event) ? pageName(entry(event)!.path) : "Entrada no disponible"),
    pages: aggregate(event => pageName(event.path)),
    devices: aggregate(event => ({ mobile: "Celular", desktop: "Escritorio", tablet: "Tablet" })[event.device_type ?? ""] ?? "No disponible"),
    locations: aggregate(event => [event.city, event.region].filter(Boolean).join(", ") || event.country || "No disponible"),
    pageViews: [...new Set(scoped.filter(event => event.event_type === "page_view").map(event => event.path))].map(path => ({ path, title: pageName(path), views: scoped.filter(event => event.event_type === "page_view" && event.path === path).length, percent: null })).sort((a, b) => b.views - a.views),
  };
}
