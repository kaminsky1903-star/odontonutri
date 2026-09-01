import { ADMIN_PATH } from "../site";
import type { AnalyticsEventType, DeviceType } from "./types";

export function publicPath(pathname: string): string | null {
  const path = (pathname.replace(/\/+$/, "") || "/").split(/[?#@]/)[0] || "/";
  if (path === ADMIN_PATH || path.startsWith(`${ADMIN_PATH}/`)) {
    return null;
  }
  if (!path.startsWith("/") || path.length > 200 || /[?#@]/.test(path)) {
    return null;
  }
  return path;
}

const TRAFFIC_ALIASES: Record<string, string> = {
  instagram: "instagram.com",
  ig: "instagram.com",
  facebook: "facebook.com",
  fb: "facebook.com",
  google: "google.com",
  tiktok: "tiktok.com",
};

export function normalizeTrafficHost(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const host = value.trim().toLowerCase().replace(/^www\./, "");
  if (!host || host.length > 253 || /[/?#@]/.test(host)) {
    return null;
  }
  const alias = TRAFFIC_ALIASES[host];
  if (alias) {
    return alias;
  }
  if (!/^[a-z0-9][a-z0-9._-]{0,251}$/.test(host)) {
    return null;
  }
  return host;
}

export function utmSourceHost(
  search = typeof location === "undefined" ? "" : location.search,
): string | null {
  const query = search.startsWith("?") ? search.slice(1) : search;
  if (!query) {
    return null;
  }
  try {
    return normalizeTrafficHost(new URLSearchParams(query).get("utm_source"));
  } catch {
    return null;
  }
}

export function inAppSocialHost(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
): string | null {
  if (/Instagram/i.test(userAgent)) {
    return "instagram.com";
  }
  if (/FBAN|FBAV/i.test(userAgent)) {
    return "facebook.com";
  }
  return null;
}

export function referrerHost(
  referrer = typeof document === "undefined" ? "" : document.referrer,
  currentHost = typeof location === "undefined" ? "" : location.hostname,
): string | null {
  if (!referrer) {
    return null;
  }
  try {
    const host = new URL(referrer).hostname.replace(/^www\./i, "").toLowerCase();
    const here = currentHost.replace(/^www\./i, "").toLowerCase();
    if (!host || host === here || /[/?#@]/.test(host) || host.length > 253) {
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

export function displayTrafficName(host: string | null | undefined): string {
  if (!host) {
    return "Directo";
  }
  if (host === "instagram.com" || host === "instagram") {
    return "Instagram";
  }
  if (host === "facebook.com" || host === "facebook") {
    return "Facebook";
  }
  if (host === "tiktok.com" || host === "tiktok") {
    return "TikTok";
  }
  return host;
}

export function approxCity(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const city = value.normalize("NFC").trim().replace(/\s+/g, " ").slice(0, 80);
  if (city.length < 2 || /[/?#@]/.test(city) || /https?:/i.test(city)) {
    return null;
  }
  return city;
}

export function deviceType(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
): DeviceType {
  if (/iPad|Tablet|PlayBook/i.test(userAgent)) {
    return "tablet";
  }
  if (/Mobi|Android.+Mobile|iPhone|iPod/i.test(userAgent)) {
    return "mobile";
  }
  return "desktop";
}

export function eventTypeFromHref(
  href: string,
  origin = typeof location === "undefined"
    ? "https://www.odontonutri.com"
    : location.origin,
): AnalyticsEventType | null {
  const value = href.trim();
  if (!value || value.startsWith("#")) {
    return null;
  }
  if (value.toLowerCase().startsWith("tel:")) {
    return "phone_click";
  }

  try {
    const url = new URL(value, origin);
    const path = url.pathname.toLowerCase();
    const host = url.hostname.toLowerCase();
    if (
      path.includes("whatsapp.html") ||
      host === "wa.me" ||
      host.endsWith(".wa.me") ||
      host === "wa.link" ||
      host.endsWith(".wa.link") ||
      host === "api.whatsapp.com"
    ) {
      return "whatsapp_click";
    }
    if (
      host === "maps.apple.com" ||
      host === "maps.google.com" ||
      (host === "www.google.com" && path.startsWith("/maps")) ||
      (host.endsWith(".google.com") && path.includes("/maps"))
    ) {
      return "location_click";
    }
  } catch {
    return null;
  }

  return null;
}
