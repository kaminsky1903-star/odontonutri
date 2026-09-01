import { getSupabaseClient } from "../admin/supabaseClient";
import {
  approxCity,
  deviceType,
  eventTypeFromHref,
  publicPath,
} from "./sanitize";
import {
  consumeVisitFlag,
  getAnonymousSessionId,
  getAnonymousVisitorId,
  readCachedCity,
  sessionTrafficSource,
  writeCachedCity,
} from "./session";
import type { AnalyticsEventType } from "./types";

function analyticsEnabled() {
  return import.meta.env.MODE !== "test";
}

let cityPromise: Promise<string | null> | null = null;

async function fetchApproxCity(): Promise<string | null> {
  const cached = readCachedCity();
  if (cached !== undefined) {
    return cached;
  }
  try {
    const response = await fetch("/api/geo", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      writeCachedCity(null);
      return null;
    }
    const payload: unknown = await response.json();
    const city =
      payload && typeof payload === "object" && "city" in payload
        ? approxCity((payload as { city: unknown }).city)
        : null;
    writeCachedCity(city);
    return city;
  } catch {
    writeCachedCity(null);
    return null;
  }
}

function loadApproxCity() {
  if (!cityPromise) {
    cityPromise = fetchApproxCity();
  }
  return cityPromise;
}

async function recordEvent(eventType: AnalyticsEventType) {
  if (!analyticsEnabled()) {
    return;
  }

  try {
    const path = publicPath(window.location.pathname);
    const sessionId = getAnonymousSessionId();
    const supabase = getSupabaseClient();
    if (!path || !sessionId || !supabase) {
      return;
    }

    const payload = {
      event_type: eventType,
      path,
      session_id: sessionId,
      referrer_host: sessionTrafficSource(),
      device_type: deviceType(),
    };
    const { error } = await supabase.from("analytics_events").insert({
      ...payload,
      visitor_id: getAnonymousVisitorId(),
      city: await loadApproxCity(),
    });
    if (error) {
      await supabase.from("analytics_events").insert(payload);
    }
  } catch {
    // Analytics must never break the public site.
  }
}

export function recordVisitAndPageView() {
  if (!analyticsEnabled()) {
    return;
  }
  if (consumeVisitFlag()) {
    void recordEvent("visit");
  }
  void recordEvent("page_view");
}

export function attachClickTracking() {
  if (!analyticsEnabled()) {
    return () => {};
  }
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const link = target.closest("a");
    const href = link?.getAttribute("href");
    if (!href) {
      return;
    }
    const eventType = eventTypeFromHref(href);
    if (!eventType) {
      return;
    }
    void recordEvent(eventType);
  };

  document.addEventListener("click", onClick, true);
  return () => {
    document.removeEventListener("click", onClick, true);
  };
}
