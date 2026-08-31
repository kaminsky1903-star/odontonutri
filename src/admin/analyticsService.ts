import { getSupabaseClient } from "./supabaseClient";
import { summarizeAnalyticsEvents } from "../analytics/summary";
import type { AnalyticsEvent } from "../analytics/types";
import { EMPTY_ANALYTICS, type AnalyticsSnapshot } from "./analyticsTypes";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function asEvents(value: unknown): AnalyticsEvent[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((row): row is AnalyticsEvent => {
    if (!row || typeof row !== "object") {
      return false;
    }
    const event = row as Partial<AnalyticsEvent>;
    return (
      typeof event.created_at === "string" &&
      typeof event.event_type === "string" &&
      typeof event.path === "string"
    );
  });
}

export async function fetchAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return EMPTY_ANALYTICS;
    }

    const since = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();
    const { data, error } = await supabase
      .from("analytics_events")
      .select("created_at, event_type, path, session_id, referrer_host, device_type")
      .gte("created_at", since)
      .limit(5000);

    if (error) {
      return EMPTY_ANALYTICS;
    }

    return summarizeAnalyticsEvents(asEvents(data));
  } catch {
    return EMPTY_ANALYTICS;
  }
}
