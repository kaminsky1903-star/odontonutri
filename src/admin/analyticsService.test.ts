import { afterEach, describe, expect, it, vi } from "vitest";
import { EMPTY_ANALYTICS } from "./analyticsTypes";
import { fetchAnalyticsSnapshot } from "./analyticsService";
import { ignoreVisitorId } from "../analytics/session";

const getSupabaseClient = vi.hoisted(() => vi.fn());

vi.mock("./supabaseClient", () => ({
  getSupabaseClient,
}));

describe("analyticsService", () => {
  afterEach(() => {
    getSupabaseClient.mockReset();
    localStorage.clear();
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

  it("hides events from ignored clinic devices", async () => {
    ignoreVisitorId("11111111-1111-4111-8111-111111111111");
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
                  visitor_id: "11111111-1111-4111-8111-111111111111",
                  referrer_host: null,
                  device_type: "desktop",
                },
              ],
              error: null,
            }),
          }),
        }),
        upsert: async () => ({ error: null }),
      }),
    });

    const snapshot = await fetchAnalyticsSnapshot();
    expect(snapshot.status).toBe("ready");
    expect(snapshot.visitorsLast30Days).toBe(0);
    expect(snapshot.recentActivity).toEqual([]);
  });

  it("excludes staff devices saved on the server from every dashboard", async () => {
    const staffId = "11111111-1111-4111-8111-111111111111";
    getSupabaseClient.mockReturnValue({
      from: (table: string) => {
        if (table === "analytics_staff_devices") {
          return {
            select: async () => ({
              data: [{ visitor_id: staffId }],
              error: null,
            }),
            upsert: async () => ({ error: null }),
          };
        }
        return {
          select: () => ({
            gte: () => ({
              limit: async () => ({
                data: [
                  {
                    created_at: new Date().toISOString(),
                    event_type: "visit",
                    path: "/",
                    session_id: staffId,
                    visitor_id: staffId,
                    referrer_host: null,
                    device_type: "mobile",
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      },
    });

    const snapshot = await fetchAnalyticsSnapshot();
    expect(snapshot.status).toBe("ready");
    expect(snapshot.visitorsLast30Days).toBe(0);
    expect(snapshot.recentActivity).toEqual([]);
  });
});
