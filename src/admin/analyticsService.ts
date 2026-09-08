import { periodBounds, type Period } from "../analytics/report";
import { readAttribution } from "../analytics/attribution";
import { getSupabaseClient } from "./supabaseClient";
import {
  analyticsQueryStart,
  summarizeAnalyticsEvents,
  withoutIgnoredVisitors,
} from "../analytics/summary";
import {
  getAnonymousVisitorId,
  isVisitorUuid,
  ignoreVisitorId,
  markInternalAnalyticsBrowser,
  readIgnoredVisitorIds,
} from "../analytics/session";
import type { AnalyticsEvent } from "../analytics/types";
import { EMPTY_ANALYTICS, type AnalyticsSnapshot } from "./analyticsTypes";

const FULL_COLUMNS =
  "created_at, event_type, path, session_id, visitor_id, referrer_host, device_type, city, region, country";
const CITY_COLUMNS =
  "created_at, event_type, path, session_id, visitor_id, referrer_host, device_type, city";
const BASE_COLUMNS =
  "created_at, event_type, path, session_id, referrer_host, device_type";
const STAFF_DEVICES_TABLE = "analytics_staff_devices";

function asEvents(value: unknown): AnalyticsEvent[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") {
      return [];
    }
    const event = row as Partial<AnalyticsEvent>;
    if (
      typeof event.created_at !== "string" ||
      typeof event.event_type !== "string" ||
      typeof event.path !== "string"
    ) {
      return [];
    }
    return [
      {
        traffic_attribution: readAttribution(event.traffic_attribution),
        created_at: event.created_at,
        event_type: event.event_type,
        path: event.path,
        session_id: typeof event.session_id === "string" ? event.session_id : null,
        visitor_id: typeof event.visitor_id === "string" ? event.visitor_id : null,
        referrer_host:
          typeof event.referrer_host === "string" ? event.referrer_host : null,
        device_type:
          typeof event.device_type === "string" ? event.device_type : null,
        city: typeof event.city === "string" ? event.city : null,
        region: typeof event.region === "string" ? event.region : null,
        country: typeof event.country === "string" ? event.country : null,
      },
    ];
  });
}

async function upsertStaffVisitor(visitorId: string) {
  if (!isVisitorUuid(visitorId)) {
    return;
  }
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }
    await supabase.from(STAFF_DEVICES_TABLE).upsert(
      { visitor_id: visitorId },
      { onConflict: "visitor_id", ignoreDuplicates: true },
    );
  } catch {
    // Local opt-out still applies if the table is missing.
  }
}

export async function registerCurrentStaffDevice() {
  markInternalAnalyticsBrowser();
  const visitorId = getAnonymousVisitorId();
  if (visitorId) {
    await upsertStaffVisitor(visitorId);
  }
}

export async function ignoreStaffVisitor(visitorId: string) {
  ignoreVisitorId(visitorId);
  await upsertStaffVisitor(visitorId);
}

async function fetchStaffVisitorIds(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return [];
    }
    const result = await supabase.from(STAFF_DEVICES_TABLE).select("visitor_id");
    if (result.error || !Array.isArray(result.data)) {
      return [];
    }
    return result.data.flatMap((row) => {
      if (!row || typeof row !== "object" || !("visitor_id" in row)) {
        return [];
      }
      const id = (row as { visitor_id: unknown }).visitor_id;
      return typeof id === "string" && id.length > 0 ? [id] : [];
    });
  } catch {
    return [];
  }
}

export async function fetchAnalyticsSnapshot(period?: Period): Promise<AnalyticsSnapshot> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return EMPTY_ANALYTICS;
    const now = new Date();
    const bounds = period ? periodBounds(period, now) : null;
    if (period && !bounds) return { ...EMPTY_ANALYTICS, message: "Revisá el rango de fechas." };
    await registerCurrentStaffDevice();
    const start = Math.min(analyticsQueryStart(now).getTime(), bounds?.start ?? Infinity);
    const query = async (columns: string) => {
      const rows: unknown[] = [];
      let offset = 0;
      while (true) {
        const result = await supabase.from("analytics_events").select(columns, { count: "exact" })
          .gte("created_at", new Date(start).toISOString()).lte("created_at", now.toISOString())
          .order("created_at", { ascending: true }).order("id", { ascending: true })
          .range(offset, offset + 499);
        if (result.error) return { data: null, error: result.error };
        const page = Array.isArray(result.data) ? result.data : [];
        rows.push(...page);
        offset += page.length;
        if ((result.count != null && offset >= result.count) || (result.count == null && page.length < 500)) break;
        if (!page.length) throw new Error("Incomplete analytics response");
      }
      return { data: rows, error: null };
    };
    const [first, staffIds] = await Promise.all([query(FULL_COLUMNS + ", traffic_attribution"), fetchStaffVisitorIds()]);
    let result = first;
    for (const columns of [FULL_COLUMNS, CITY_COLUMNS, BASE_COLUMNS]) {
      if (!result.error) break;
      if (!["42703", "PGRST204"].includes(result.error.code)) break;
      result = await query(columns);
    }
    if (result.error) return { ...EMPTY_ANALYTICS, message: "No se pudieron cargar las métricas. Intentá actualizar." };
    const ignored = new Set([...readIgnoredVisitorIds(), ...staffIds]);
    const events = withoutIgnoredVisitors(asEvents(result.data), ignored);
    return { ...summarizeAnalyticsEvents(events, now), events };
  } catch {
    return { ...EMPTY_ANALYTICS, message: "No se pudieron cargar las métricas completas. Intentá actualizar." };
  }
}
