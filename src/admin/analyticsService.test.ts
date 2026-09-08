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
          gte: () => ({ lte() { return this; }, order() { return this; },
            range: async () => ({ data: null, error: { message: "denied" } }),
          }),
        }),
      }),
    });
    await expect(fetchAnalyticsSnapshot()).resolves.toMatchObject({ status: "pending", message: "No se pudieron cargar las métricas. Intentá actualizar." });
  });

  it("summarizes rows returned for an authenticated session", async () => {
    getSupabaseClient.mockReturnValue({
      from: () => ({
        select: () => ({
          gte: () => ({ lte() { return this; }, order() { return this; },
            range: async () => ({
              data: [
                {
                  created_at: new Date(Date.now() - 1000).toISOString(),
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
          gte: () => ({ lte() { return this; }, order() { return this; },
            range: async () => ({
              data: [
                {
                  created_at: new Date(Date.now() - 1000).toISOString(),
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
            gte: () => ({ lte() { return this; }, order() { return this; },
              range: async () => ({
                data: [
                  {
                    created_at: new Date(Date.now() - 1000).toISOString(),
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



it("loads all pages, including when the server page cap is below the requested size", async () => {
  const rows = Array.from({ length: 1201 }, (_, i) => ({ created_at: new Date(Date.now() - 1000).toISOString(), event_type: "visit", path: "/", session_id: `s${i}` }));
  const ranges: number[] = [];
  getSupabaseClient.mockReturnValue({ from: (table: string) => table === "analytics_staff_devices" ? { select: async () => ({ data: [] }), upsert: async () => ({ error: null }) } : {
    select: () => ({ gte() { return this; }, lte() { return this; }, order() { return this; }, range: async (start: number) => {
      ranges.push(start); return { data: rows.slice(start, start + 200), count: rows.length, error: null };
    } }),
  } });
  const result = await fetchAnalyticsSnapshot();
  expect(result.events).toHaveLength(1201);
  expect(ranges).toEqual([0, 200, 400, 600, 800, 1000, 1200]);
});

it("does not display partial totals when a later page fails", async () => {
  getSupabaseClient.mockReturnValue({ from: (table: string) => table === "analytics_staff_devices" ? { select: async () => ({ data: [] }), upsert: async () => ({ error: null }) } : {
    select: () => ({ gte() { return this; }, lte() { return this; }, order() { return this; }, range: async (start: number) => start ? { data: null, error: { code: "500", message: "failed" } } : { data: [{ created_at: new Date().toISOString(), event_type: "visit", path: "/" }], count: 2, error: null } }),
  } });
  const result = await fetchAnalyticsSnapshot();
  expect(result.status).toBe("pending");
  expect(result.events).toBeUndefined();
});

it("falls back to the existing schema without inventing attribution", async () => {
  const columns: string[] = [];
  getSupabaseClient.mockReturnValue({ from: (table: string) => table === "analytics_staff_devices" ? { select: async () => ({ data: [] }), upsert: async () => ({ error: null }) } : {
    select: (selection: string) => {
      columns.push(selection);
      return { gte() { return this; }, lte() { return this; }, order() { return this; }, range: async () => selection.includes("traffic_attribution") ? { data: null, error: { code: "PGRST204" } } : { data: [{ created_at: new Date(Date.now() - 1000).toISOString(), event_type: "visit", path: "/", session_id: "s" }], count: 1, error: null } };
    },
  } });
  const result = await fetchAnalyticsSnapshot();
  expect(result.status).toBe("ready");
  expect(columns).toHaveLength(2);
  expect(result.events?.[0].traffic_attribution).toBeNull();
});
