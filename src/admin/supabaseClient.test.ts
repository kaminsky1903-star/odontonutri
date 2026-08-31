import { describe, expect, it } from "vitest";
import {
  isForbiddenBrowserSupabaseKey,
  isSupabasePublishableKey,
} from "./supabaseClient";

describe("Supabase browser keys", () => {
  it("accepts only sb_publishable_ keys in the web client", () => {
    expect(isSupabasePublishableKey("sb_publishable_test-value")).toBe(true);
    expect(isSupabasePublishableKey(" sb_publishable_test-value ")).toBe(true);
  });

  it("rejects secrets, JWT keys, and empty values", () => {
    expect(isSupabasePublishableKey("")).toBe(false);
    expect(isSupabasePublishableKey("sb_secret_do-not-use")).toBe(false);
    expect(isSupabasePublishableKey("eyJplaceholder")).toBe(false);
    expect(isForbiddenBrowserSupabaseKey("sb_secret_do-not-use")).toBe(true);
    expect(isForbiddenBrowserSupabaseKey("eyJplaceholder")).toBe(true);
    expect(isForbiddenBrowserSupabaseKey("service_role-placeholder")).toBe(true);
    expect(isForbiddenBrowserSupabaseKey("sb_publishable_test-value")).toBe(
      false,
    );
  });
});
