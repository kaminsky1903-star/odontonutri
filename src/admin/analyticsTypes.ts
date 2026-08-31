export const ANALYTICS_PENDING_MESSAGE = "Analíticas pendientes de conexión";

export type TrafficSource = {
  name: string;
  sessions: number | null;
};

export type PageViewStat = {
  path: string;
  title: string;
  views: number | null;
};

export type CityStat = {
  city: string;
  visitors: number | null;
};

export type DeviceStat = {
  type: "desktop" | "mobile" | "tablet";
  label: string;
  visitors: number | null;
};

export type AnalyticsSnapshot = {
  status: "pending" | "ready";
  message: string;
  visitorsToday: number | null;
  visitorsLast7Days: number | null;
  visitorsLast30Days: number | null;
  activeNow: number | null;
  whatsappClicks: number | null;
  phoneClicks: number | null;
  locationClicks: number | null;
  conversionRate: number | null;
  trafficSources: TrafficSource[];
  topPages: PageViewStat[];
  cities: CityStat[];
  devices: DeviceStat[];
};

export const EMPTY_ANALYTICS: AnalyticsSnapshot = {
  status: "pending",
  message: ANALYTICS_PENDING_MESSAGE,
  visitorsToday: null,
  visitorsLast7Days: null,
  visitorsLast30Days: null,
  activeNow: null,
  whatsappClicks: null,
  phoneClicks: null,
  locationClicks: null,
  conversionRate: null,
  trafficSources: [],
  topPages: [],
  cities: [],
  devices: [],
};
