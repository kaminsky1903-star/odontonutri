import { afterEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";

const insert = vi.hoisted(() => vi.fn());
vi.mock("../admin/supabaseClient", () => ({ getSupabaseClient: () => ({ from: () => ({ insert }) }) }));
vi.mock("./session", () => ({
  shouldRecordPublicAnalytics: () => true, consumeVisitFlag: () => false,
  getAnonymousSessionId: () => "session-kept", getAnonymousVisitorId: () => "visitor-kept",
  sessionTrafficSource: () => "google.com", readCachedGeo: () => ({ city: "Bella Vista", region: "Buenos Aires", country: "AR" }), writeCachedGeo: () => {},
}));
import { recordVisitAndPageView } from "./track";

afterEach(() => { insert.mockReset(); sessionStorage.clear(); window.history.replaceState(null, "", "/"); });

describe("compatible attribution tracking", () => {
  it("keeps identity and records advertising evidence without storing the raw click ID", async () => {
    insert.mockResolvedValue({ error: null });
    window.history.replaceState(null, "", "/?gclid=private-click-value&utm_source=google&utm_medium=cpc");
    recordVisitAndPageView();
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    expect(insert.mock.calls[0][0]).toMatchObject({ session_id: "session-kept", visitor_id: "visitor-kept", traffic_attribution: { google_click: "gclid", medium: "cpc" } });
    expect(JSON.stringify(insert.mock.calls)).not.toContain("private-click-value");
  });

  it("uses the existing payload if the attribution column has not been installed", async () => {
    insert.mockResolvedValueOnce({ error: { code: "PGRST204" } }).mockResolvedValueOnce({ error: null });
    recordVisitAndPageView();
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(2));
    expect(insert.mock.calls[1][0]).toMatchObject({ visitor_id: "visitor-kept", event_type: "page_view", city: "Bella Vista" });
    expect(insert.mock.calls[1][0]).not.toHaveProperty("traffic_attribution");
  });

  it("does not retry an ambiguous server failure that could duplicate a recorded event", async () => {
    insert.mockResolvedValue({ error: { code: "500" } });
    recordVisitAndPageView();
    await waitFor(() => expect(insert).toHaveBeenCalledTimes(1));
    await Promise.resolve();
    expect(insert).toHaveBeenCalledTimes(1);
  });
});
