export const SESSION_STORAGE_KEY = "odontonutri_analytics_sid";
export const VISITOR_STORAGE_KEY = "odontonutri_analytics_vid";
export const VISIT_FLAG_KEY = "odontonutri_analytics_visit";
export const CITY_CACHE_KEY = "odontonutri_analytics_city";
export const SOURCE_CACHE_KEY = "odontonutri_analytics_src";

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
};
