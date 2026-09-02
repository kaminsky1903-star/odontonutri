export const SESSION_STORAGE_KEY = "odontonutri_analytics_sid";
export const VISITOR_STORAGE_KEY = "odontonutri_analytics_vid";
export const VISIT_FLAG_KEY = "odontonutri_analytics_visit";
export const CITY_CACHE_KEY = "odontonutri_analytics_city";
export const SOURCE_CACHE_KEY = "odontonutri_analytics_src";
export const GEO_CACHE_KEY = "odontonutri_analytics_geo";
export const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const INTERNAL_ANALYTICS_KEY = "odontonutri_analytics_internal";
export const INTERNAL_ANALYTICS_COOKIE = "odontonutri_staff";
export const IGNORED_VISITORS_KEY = "odontonutri_analytics_ignored";

export const ANALYTICS_EVENT_TYPES = [
  "visit",
  "page_view",
  "whatsapp_click",
  "phone_click",
  "location_click",
] as const;

export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export type DeviceType = "desktop" | "mobile" | "tablet";

export type AnalyticsEvent = {
  created_at: string;
  event_type: string;
  path: string;
  session_id: string | null;
  visitor_id: string | null;
  referrer_host: string | null;
  device_type: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
};
