import {
  inAppSocialHost,
  referrerHost,
  utmSourceHost,
} from "./sanitize";
import {
  CITY_CACHE_KEY,
  SESSION_STORAGE_KEY,
  SOURCE_CACHE_KEY,
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
  try {
    return readUuid(localStorage, VISITOR_STORAGE_KEY);
  } catch {
    return null;
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
  try {
    const cached = sessionStorage.getItem(CITY_CACHE_KEY);
    if (cached === null) {
      return undefined;
    }
    return cached || null;
  } catch {
    return undefined;
  }
}

export function writeCachedCity(city: string | null) {
  try {
    sessionStorage.setItem(CITY_CACHE_KEY, city ?? "");
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
