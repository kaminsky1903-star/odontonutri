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
