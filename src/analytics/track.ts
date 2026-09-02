import { getSupabaseClient } from "../admin/supabaseClient";
import {
  approxCity,
  approxCountry,
  approxRegion,
  deviceType,
  eventTypeFromHref,
  publicPath,
} from "./sanitize";
import {
  consumeVisitFlag,
  getAnonymousSessionId,
  getAnonymousVisitorId,
  readCachedGeo,
  sessionTrafficSource,
  shouldRecordPublicAnalytics,
  writeCachedGeo,
  type ApproxGeo,
} from "./session";
import type { AnalyticsEventType } from "./types";

function analyticsEnabled() {
  return shouldRecordPublicAnalytics();
}

let geoPromise: Promise<ApproxGeo> | null = null;

async function fetchApproxGeo(): Promise<ApproxGeo> {
  const cached = readCachedGeo();
  if (cached !== undefined) {
    return cached ?? { city: null, region: null, country: null };
  }
  const empty = { city: null, region: null, country: null };
  try {
    const response = await fetch("/api/geo", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      writeCachedGeo(empty);
      return empty;
    }
    const payload: unknown = await response.json();
    const geo =
      payload && typeof payload === "object"
        ? {
            city: approxCity((payload as { city?: unknown }).city),
            region: approxRegion((payload as { region?: unknown }).region),
            country: approxCountry((payload as { country?: unknown }).country),
          }
        : empty;
    writeCachedGeo(geo);
    return geo;
  } catch {
    writeCachedGeo(empty);
    return empty;
  }
}

function loadApproxGeo() {
  if (!geoPromise) {
    geoPromise = fetchApproxGeo();
  }
  return geoPromise;
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
    const location = await loadApproxGeo();
    const withVisitor = {
      ...payload,
      visitor_id: getAnonymousVisitorId(),
      city: location.city,
    };
    const { error: locationError } = await supabase.from("analytics_events").insert({
      ...withVisitor,
      region: location.region,
      country: location.country,
    });
    if (locationError) {
      const { error: visitorError } = await supabase
        .from("analytics_events")
        .insert(withVisitor);
      if (visitorError) {
        await supabase.from("analytics_events").insert(payload);
      }
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
