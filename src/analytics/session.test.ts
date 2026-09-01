import { afterEach, describe, expect, it } from "vitest";
import { getAnonymousSessionId, getAnonymousVisitorId, sessionTrafficSource } from "./session";
import { SESSION_STORAGE_KEY, VISITOR_STORAGE_KEY } from "./types";

describe("analytics session", () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
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
});
