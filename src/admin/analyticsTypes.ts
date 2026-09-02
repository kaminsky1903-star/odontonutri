export const ANALYTICS_PENDING_MESSAGE = "Analíticas pendientes de conexión";

export type TrafficSource = {
  name: string;
  sessions: number | null;
  percent: number | null;
};

export type PageViewStat = {
  path: string;
  title: string;
  views: number | null;
  percent: number | null;
};

export type DeviceStat = {
  type: "desktop" | "mobile" | "tablet";
  label: string;
  visitors: number | null;
  percent: number | null;
};

export type RecentActivity = {
  id: string;
  at: string;
  action: string;
  page: string;
  source: string;
  device: string;
  isContact: boolean;
  landing: string | null;
  pages: string[];
  durationMinutes: number | null;
  visitorId: string | null;
  visitorLabel: string | null;
  visitCount: number;
  location: string | null;
  city: string | null;
};

export type DailyVisit = {
  date: string;
  value: number;
};

export type HourStat = {
  hour: number;
  value: number;
};

export type AnalyticsSnapshot = {
  status: "pending" | "ready";
  message: string;
  visitorsToday: number | null;
  visitorsLast7Days: number | null;
  visitorsLast30Days: number | null;
  activeNow: number | null;
  whatsappClicksToday: number | null;
  whatsappClicksLast7Days: number | null;
  whatsappClicksLastMonth: number | null;
  phoneClicks: number | null;
  locationClicks: number | null;
  conversionRate: number | null;
  dailyVisits: DailyVisit[];
  conversionsByPage: PageViewStat[];
  whatsappHours: HourStat[];
  trafficSources: TrafficSource[];
  topPages: PageViewStat[];
  devices: DeviceStat[];
  recentActivity: RecentActivity[];
};

export const EMPTY_ANALYTICS: AnalyticsSnapshot = {
  status: "pending",
  message: ANALYTICS_PENDING_MESSAGE,
  visitorsToday: null,
  visitorsLast7Days: null,
  visitorsLast30Days: null,
  activeNow: null,
  whatsappClicksToday: null,
  whatsappClicksLast7Days: null,
  whatsappClicksLastMonth: null,
  phoneClicks: null,
  locationClicks: null,
  conversionRate: null,
  dailyVisits: [],
  conversionsByPage: [],
  whatsappHours: [],
  trafficSources: [],
  topPages: [],
  devices: [],
  recentActivity: [],
};
