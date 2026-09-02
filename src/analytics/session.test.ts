import { afterEach, describe, expect, it } from "vitest";
import {
  applyAnalyticsOptOutFromSearch,
  clearInternalAnalyticsBrowser,
  getAnonymousSessionId,
  getAnonymousVisitorId,
  ignoreVisitorId,
  isIgnoredVisitor,
  isInternalAnalyticsBrowser,
  markInternalAnalyticsBrowser,
  sessionTrafficSource,
  shouldRecordPublicAnalytics,
} from "./session";
import {
  IGNORED_VISITORS_KEY,
  INTERNAL_ANALYTICS_KEY,
  SESSION_STORAGE_KEY,
  VISITOR_STORAGE_KEY,
} from "./types";

describe("analytics session", () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    clearInternalAnalyticsBrowser();
    document.cookie = `${VISITOR_STORAGE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  });

  it("reuses the same visitor id across sessions", () => {
    const first = getAnonymousVisitorId();
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    const later = getAnonymousVisitorId();
    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(later).toBe(first);
    expect(localStorage.getItem(VISITOR_STORAGE_KEY)).toBe(first);
    expect(document.cookie).toContain(`${VISITOR_STORAGE_KEY}=${first}`);
  });

  it("writes a 365-day first-party cookie with Path=/ and SameSite=Lax", () => {
    const assigned: string[] = [];
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        return assigned.at(-1) ?? "";
      },
      set(value: string) {
        assigned.push(value);
      },
    });

    try {
      const id = getAnonymousVisitorId();
      const cookie = assigned.find((value) =>
        value.startsWith(`${VISITOR_STORAGE_KEY}=`),
      );

      expect(id).toBeTruthy();
      expect(cookie).toContain(`Path=/`);
      expect(cookie).toContain("Max-Age=31536000");
      expect(cookie).toContain("SameSite=Lax");
      expect(cookie).not.toContain("Secure");
    } finally {
      Reflect.deleteProperty(document, "cookie");
    }
  });

  it("keeps the visitor uuid in the first-party cookie if localStorage is cleared", () => {
    const first = getAnonymousVisitorId();
    localStorage.removeItem(VISITOR_STORAGE_KEY);
    expect(getAnonymousVisitorId()).toBe(first);
  });

  it("creates a new session id without changing the visitor id", () => {
    const visitor = getAnonymousVisitorId();
    const session = getAnonymousSessionId();
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    const nextSession = getAnonymousSessionId();
    expect(nextSession).not.toBe(session);
    expect(getAnonymousVisitorId()).toBe(visitor);
  });

  it("prefers utm_source over the document referrer for the session", () => {
    expect(
      sessionTrafficSource({
        search: "?utm_source=instagram",
        referrer: "https://www.google.com/",
        currentHost: "www.odontonutri.com",
        userAgent: "Mozilla/5.0",
      }),
    ).toBe("instagram.com");
    expect(
      sessionTrafficSource({
        search: "",
        referrer: "https://www.google.com/",
        currentHost: "www.odontonutri.com",
        userAgent: "Mozilla/5.0",
      }),
    ).toBe("instagram.com");
  });

  it("uses the Instagram in-app browser when there is no referrer", () => {
    expect(
      sessionTrafficSource({
        search: "",
        referrer: "",
        currentHost: "www.odontonutri.com",
        userAgent: "Mozilla/5.0 Instagram 360.0.0.33.106",
      }),
    ).toBe("instagram.com");
  });

  it("stops recording this browser after opening the admin panel", () => {
    expect(
      shouldRecordPublicAnalytics({
        hostname: "www.odontonutri.com",
        mode: "production",
        dev: false,
      }),
    ).toBe(true);
    markInternalAnalyticsBrowser();
    const visitor = getAnonymousVisitorId();
    expect(isInternalAnalyticsBrowser()).toBe(true);
    expect(localStorage.getItem(INTERNAL_ANALYTICS_KEY)).toBe("1");
    expect(visitor).toBeTruthy();
    expect(isIgnoredVisitor(visitor)).toBe(true);
    expect(
      shouldRecordPublicAnalytics({
        hostname: "www.odontonutri.com",
        mode: "production",
        dev: false,
      }),
    ).toBe(false);
  });

  it("keeps the clinic device excluded if localStorage is cleared", () => {
    markInternalAnalyticsBrowser();
    localStorage.removeItem(INTERNAL_ANALYTICS_KEY);
    expect(isInternalAnalyticsBrowser()).toBe(true);
    expect(
      shouldRecordPublicAnalytics({
        hostname: "www.odontonutri.com",
        mode: "production",
        dev: false,
      }),
    ).toBe(false);
  });

  it("does not send analytics from localhost or the Vite dev server", () => {
    expect(
      shouldRecordPublicAnalytics({
        hostname: "localhost",
        mode: "production",
        dev: false,
      }),
    ).toBe(false);
    expect(
      shouldRecordPublicAnalytics({
        hostname: "www.odontonutri.com",
        mode: "production",
        dev: true,
      }),
    ).toBe(false);
  });

  it("opts this device out from ?analytics=off and remembers ignored visitors", () => {
    applyAnalyticsOptOutFromSearch("?analytics=off");
    expect(isInternalAnalyticsBrowser()).toBe(true);
    ignoreVisitorId("phone-visitor");
    expect(JSON.parse(localStorage.getItem(IGNORED_VISITORS_KEY) ?? "[]")).toContain(
      "phone-visitor",
    );
    clearInternalAnalyticsBrowser();
    expect(isInternalAnalyticsBrowser()).toBe(false);
    expect(isIgnoredVisitor("phone-visitor")).toBe(true);
  });
});
