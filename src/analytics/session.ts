import {
  inAppSocialHost,
  referrerHost,
  utmSourceHost,
} from "./sanitize";
import {
  CITY_CACHE_KEY,
  GEO_CACHE_KEY,
  IGNORED_VISITORS_KEY,
  INTERNAL_ANALYTICS_COOKIE,
  INTERNAL_ANALYTICS_KEY,
  SESSION_STORAGE_KEY,
  SOURCE_CACHE_KEY,
  VISITOR_COOKIE_MAX_AGE,
  VISITOR_STORAGE_KEY,
  VISIT_FLAG_KEY,
} from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readUuid(storage: Storage, key: string) {
  try {
    const existing = storage.getItem(key);
    if (existing && UUID_PATTERN.test(existing)) {
      return existing;
    }
    const id = crypto.randomUUID();
    storage.setItem(key, id);
    return id;
  } catch {
    return null;
  }
}

export function getAnonymousSessionId(): string | null {
  try {
    return readUuid(sessionStorage, SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getAnonymousVisitorId(): string | null {
  const fromCookie = readVisitorCookie();
  if (fromCookie) {
    persistVisitorId(fromCookie);
    return fromCookie;
  }
  try {
    const existing = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (existing && UUID_PATTERN.test(existing)) {
      persistVisitorId(existing);
      return existing;
    }
  } catch {
    // Fall through to a new id.
  }
  try {
    const id = crypto.randomUUID();
    persistVisitorId(id);
    return id;
  } catch {
    return null;
  }
}

function persistVisitorId(id: string) {
  try {
    localStorage.setItem(VISITOR_STORAGE_KEY, id);
  } catch {
    // Cookie still identifies the browser.
  }
  writeVisitorCookie(id);
}

function readVisitorCookie(): string | null {
  try {
    const prefix = `${VISITOR_STORAGE_KEY}=`;
    const found = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(prefix));
    if (!found) {
      return null;
    }
    const value = decodeURIComponent(found.slice(prefix.length));
    return UUID_PATTERN.test(value) ? value : null;
  } catch {
    return null;
  }
}

function writeVisitorCookie(id: string) {
  try {
    document.cookie = `${VISITOR_STORAGE_KEY}=${encodeURIComponent(id)}; Path=/; Max-Age=${VISITOR_COOKIE_MAX_AGE}; SameSite=Lax${cookieSecureFlag()}`;
  } catch {
    // Ignore cookie failures.
  }
}

export function consumeVisitFlag(): boolean {
  try {
    if (sessionStorage.getItem(VISIT_FLAG_KEY)) {
      return false;
    }
    sessionStorage.setItem(VISIT_FLAG_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function readCachedCity(): string | null | undefined {
  const geo = readCachedGeo();
  if (geo === undefined) {
    return undefined;
  }
  return geo?.city ?? null;
}

export function writeCachedCity(city: string | null) {
  writeCachedGeo(city ? { city, region: null, country: null } : null);
}

export type ApproxGeo = {
  city: string | null;
  region: string | null;
  country: string | null;
};

export function readCachedGeo(): ApproxGeo | null | undefined {
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached !== null) {
      const parsed: unknown = JSON.parse(cached);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      const geo = parsed as Partial<ApproxGeo>;
      return {
        city: typeof geo.city === "string" ? geo.city : null,
        region: typeof geo.region === "string" ? geo.region : null,
        country: typeof geo.country === "string" ? geo.country : null,
      };
    }
    const legacy = sessionStorage.getItem(CITY_CACHE_KEY);
    if (legacy === null) {
      return undefined;
    }
    return { city: legacy || null, region: null, country: null };
  } catch {
    return undefined;
  }
}

export function writeCachedGeo(geo: ApproxGeo | null) {
  try {
    sessionStorage.setItem(
      GEO_CACHE_KEY,
      JSON.stringify(
        geo ?? { city: null, region: null, country: null },
      ),
    );
  } catch {
    // Ignore storage failures.
  }
}

export function readCachedSource(): string | null | undefined {
  try {
    const cached = sessionStorage.getItem(SOURCE_CACHE_KEY);
    if (cached === null) {
      return undefined;
    }
    return cached || null;
  } catch {
    return undefined;
  }
}

export function writeCachedSource(source: string | null) {
  try {
    sessionStorage.setItem(SOURCE_CACHE_KEY, source ?? "");
  } catch {
    // Ignore storage failures.
  }
}

export function sessionTrafficSource(options?: {
  search?: string;
  referrer?: string;
  currentHost?: string;
  userAgent?: string;
}): string | null {
  const cached = readCachedSource();
  if (cached !== undefined) {
    return cached;
  }
  const source =
    utmSourceHost(options?.search) ??
    referrerHost(options?.referrer, options?.currentHost) ??
    inAppSocialHost(options?.userAgent) ??
    null;
  writeCachedSource(source);
  return source;
}

const INTERNAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 730;

function cookieSecureFlag() {
  return window.location.protocol === "https:" ? "; Secure" : "";
}

function readInternalCookie() {
  try {
    return document.cookie.split(";").some(
      (part) => part.trim() === `${INTERNAL_ANALYTICS_COOKIE}=1`,
    );
  } catch {
    return false;
  }
}

function writeInternalCookie() {
  try {
    document.cookie = `${INTERNAL_ANALYTICS_COOKIE}=1; Path=/; Max-Age=${INTERNAL_COOKIE_MAX_AGE}; SameSite=Lax${cookieSecureFlag()}`;
  } catch {
    // Ignore cookie failures.
  }
}

function clearInternalCookie() {
  try {
    document.cookie = `${INTERNAL_ANALYTICS_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${cookieSecureFlag()}`;
  } catch {
    // Ignore cookie failures.
  }
}

export function isVisitorUuid(id: string | null | undefined): id is string {
  return Boolean(id && UUID_PATTERN.test(id));
}

export function isInternalAnalyticsBrowser() {
  try {
    if (localStorage.getItem(INTERNAL_ANALYTICS_KEY) === "1") {
      return true;
    }
  } catch {
    // Fall through to the cookie.
  }
  return readInternalCookie();
}

export function readIgnoredVisitorIds(): string[] {
  try {
    const raw = localStorage.getItem(IGNORED_VISITORS_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export function ignoreVisitorId(id: string) {
  const next = new Set(readIgnoredVisitorIds());
  next.add(id);
  try {
    localStorage.setItem(IGNORED_VISITORS_KEY, JSON.stringify([...next]));
  } catch {
    // Ignore storage failures.
  }
}

export function isIgnoredVisitor(id: string | null | undefined) {
  if (!id) {
    return false;
  }
  return readIgnoredVisitorIds().includes(id);
}

export function markInternalAnalyticsBrowser() {
  try {
    localStorage.setItem(INTERNAL_ANALYTICS_KEY, "1");
  } catch {
    // Ignore storage failures.
  }
  writeInternalCookie();
  const id = getAnonymousVisitorId();
  if (id) {
    ignoreVisitorId(id);
  }
}

export function clearInternalAnalyticsBrowser() {
  try {
    localStorage.removeItem(INTERNAL_ANALYTICS_KEY);
  } catch {
    // Ignore storage failures.
  }
  clearInternalCookie();
}

function stripAnalyticsParam() {
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("analytics")) {
      return;
    }
    url.searchParams.delete("analytics");
    const next = `${url.pathname}${url.search}${url.hash}` || "/";
    window.history.replaceState(null, "", next);
  } catch {
    // Ignore history failures.
  }
}

export function applyAnalyticsOptOutFromSearch(search?: string) {
  const raw =
    search ?? (typeof window !== "undefined" ? window.location.search : "");
  const params = new URLSearchParams(
    raw.startsWith("?") ? raw.slice(1) : raw,
  );
  const flag = params.get("analytics");
  if (flag === "off") {
    markInternalAnalyticsBrowser();
    if (search === undefined) {
      stripAnalyticsParam();
    }
    return;
  }
  if (flag === "on") {
    clearInternalAnalyticsBrowser();
    if (search === undefined) {
      stripAnalyticsParam();
    }
  }
}

export function shouldRecordPublicAnalytics(options?: {
  hostname?: string;
  mode?: string;
  dev?: boolean;
}) {
  const mode = options?.mode ?? import.meta.env.MODE;
  if (mode === "test") {
    return false;
  }
  const dev = options?.dev ?? import.meta.env.DEV;
  if (dev) {
    return false;
  }
  const hostname =
    options?.hostname ??
    (typeof window !== "undefined" ? window.location.hostname : "");
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  ) {
    return false;
  }
  return !isInternalAnalyticsBrowser();
}
