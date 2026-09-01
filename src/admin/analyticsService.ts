import { getSupabaseClient } from "./supabaseClient";
import {
  analyticsQueryStart,
  summarizeAnalyticsEvents,
} from "../analytics/summary";
import type { AnalyticsEvent } from "../analytics/types";
import { EMPTY_ANALYTICS, type AnalyticsSnapshot } from "./analyticsTypes";

const FULL_COLUMNS =
  "created_at, event_type, path, session_id, visitor_id, referrer_host, device_type, city";
const BASE_COLUMNS =
  "created_at, event_type, path, session_id, referrer_host, device_type";

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
      },
    ];
  });
}

export async function fetchAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return EMPTY_ANALYTICS;
    }

    const since = analyticsQueryStart().toISOString();
    const query = (columns: string) =>
      supabase
        .from("analytics_events")
        .select(columns)
        .gte("created_at", since)
        .limit(5000);

    const full = await query(FULL_COLUMNS);
    const result = full.error ? await query(BASE_COLUMNS) : full;

    if (result.error) {
      return EMPTY_ANALYTICS;
    }

    return summarizeAnalyticsEvents(asEvents(result.data));
  } catch {
    return EMPTY_ANALYTICS;
  }
}
