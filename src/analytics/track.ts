import { getSupabaseClient } from "../admin/supabaseClient";
import {
  deviceType,
  eventTypeFromHref,
  publicPath,
  referrerHost,
} from "./sanitize";
import { consumeVisitFlag, getAnonymousSessionId } from "./session";
import type { AnalyticsEventType } from "./types";

function analyticsEnabled() {
  return import.meta.env.MODE !== "test";
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

    await supabase.from("analytics_events").insert({
      event_type: eventType,
      path,
      session_id: sessionId,
      referrer_host: referrerHost(),
      device_type: deviceType(),
    });
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
