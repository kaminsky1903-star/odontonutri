import { afterEach, describe, expect, it, vi } from "vitest";
import { EMPTY_ANALYTICS } from "./analyticsTypes";
import { fetchAnalyticsSnapshot } from "./analyticsService";

const getSupabaseClient = vi.hoisted(() => vi.fn());

vi.mock("./supabaseClient", () => ({
  getSupabaseClient,
}));

describe("analyticsService", () => {
  afterEach(() => {
    getSupabaseClient.mockReset();
  });

  it("returns empty analytics when Supabase is not available", async () => {
    getSupabaseClient.mockReturnValue(null);
    await expect(fetchAnalyticsSnapshot()).resolves.toEqual(EMPTY_ANALYTICS);
  });

  it("returns empty analytics when the query is denied", async () => {
    getSupabaseClient.mockReturnValue({
      from: () => ({
        select: () => ({
          gte: () => ({
            limit: async () => ({ data: null, error: { message: "denied" } }),
          }),
        }),
      }),
    });
    await expect(fetchAnalyticsSnapshot()).resolves.toEqual(EMPTY_ANALYTICS);
  });

  it("summarizes rows returned for an authenticated session", async () => {
    getSupabaseClient.mockReturnValue({
      from: () => ({
        select: () => ({
          gte: () => ({
            limit: async () => ({
              data: [
                {
                  created_at: new Date().toISOString(),
                  event_type: "visit",
                  path: "/",
                  session_id: "11111111-1111-4111-8111-111111111111",
                  referrer_host: null,
                  device_type: "desktop",
                },
              ],
              error: null,
            }),
          }),
        }),
      }),
    });

    const snapshot = await fetchAnalyticsSnapshot();
    expect(snapshot.status).toBe("ready");
    expect(snapshot.visitorsLast30Days).toBe(1);
    expect(snapshot.whatsappClicksToday).toBe(0);
  });
});
