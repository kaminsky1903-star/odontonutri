import type { AnalyticsEvent } from "./types";
import { displayTrafficName, normalizeTrafficHost } from "./sanitize";

export type Attribution = {
  version: 1 | 2;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  google_click: "gclid" | "gbraid" | "wbraid" | null;
  google_ad_marker: "gad_source" | "gad_campaignid" | null;
};

function tag(value: unknown): string | null {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 120) || null : null;
}

export function readAttribution(value: unknown): Attribution | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<Attribution>;
  if (raw.version !== 1 && raw.version !== 2) return null;
  return { version: raw.version, source: tag(raw.source), medium: tag(raw.medium), campaign: tag(raw.campaign),
    google_click: raw.google_click === "gclid" || raw.google_click === "gbraid" || raw.google_click === "wbraid" ? raw.google_click : null,
    google_ad_marker: raw.google_ad_marker === "gad_source" || raw.google_ad_marker === "gad_campaignid" ? raw.google_ad_marker : null };
}

export function attributionFromSearch(search: string): Attribution {
  const params = new URLSearchParams(search);
  return { version: 2, source: tag(params.get("utm_source")), medium: tag(params.get("utm_medium")),
    campaign: tag(params.get("utm_campaign")),
    google_click: (["gclid", "gbraid", "wbraid"] as const).find(key => Boolean(params.get(key)?.trim())) ?? null,
    google_ad_marker: (["gad_campaignid", "gad_source"] as const).find(key => Boolean(params.get(key)?.trim())) ?? null };
}

// Store only the presence/type of an advertising identifier, never its raw value.
export function sessionAttribution(): Attribution {
  const key = "odontonutri_analytics_attribution_v2";
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) {
      const parsed = readAttribution(JSON.parse(existing));
      if (parsed) return parsed;
    }
  } catch { /* Storage is optional. */ }
  const result = attributionFromSearch(window.location.search);
  try { sessionStorage.setItem(key, JSON.stringify(result)); } catch { /* Continue without persistence. */ }
  return result;
}

function isGoogle(host: string | null) {
  return Boolean(host && /^(?:[a-z0-9-]+\.)?google\.(?:com|com\.ar|com\.uy|com\.br|cl|es|co\.uk|com\.mx)$/.test(host));
}

export function trafficChannel(event: AnalyticsEvent): string {
  const data = readAttribution(event.traffic_attribution);
  const source = normalizeTrafficHost(data?.source);
  const host = normalizeTrafficHost(event.referrer_host);
  if (data?.google_click || data?.google_ad_marker || (isGoogle(source) && /^(cpc|ppc|paid|paidsearch|paid_search|display|cpm)$/i.test(data?.medium ?? ""))) return "Google Ads (anuncio pago)";
  if (host === "syndicatedsearch.goog") return "syndicatedsearch";
  if (isGoogle(source) || isGoogle(host)) {
    return data?.version === 2 ? "Google (buscador común)" : "Google (origen sin distinguir)";
  }
  return displayTrafficName(source || host);
}
