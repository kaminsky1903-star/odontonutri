import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { TrendChart } from "./TrendChart";
import { summarizeAnalyticsEvents } from "../analytics/summary";

afterEach(cleanup);

describe("daily trend", () => {
  it("switches periods and exposes each day's exact value to touch and keyboard users", async () => {
    const points = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.UTC(2026, 7, i + 1, 3)).toISOString(), value: i,
    }));
    render(<TrendChart points={points} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Sesiones diarias de los últimos 7 días");
    expect(screen.getByText("182")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "0" } });
    expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toContain("23 sesiones");
    await userEvent.click(screen.getByRole("button", { name: "1 mes" }));
    expect(screen.getByRole("img")).toHaveAccessibleName("Sesiones diarias de los últimos 30 días");
    expect(screen.getByText("435")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toHaveAttribute("max", "29");
  });

  it("does not draw invented points while data is missing", () => {
    render(<TrendChart points={[]} pending />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Analíticas pendientes de conexión")).toBeInTheDocument();
  });

  it("groups sessions by the Argentine day across UTC midnight and deduplicates visits", () => {
    const event = { event_type: "visit", path: "/", session_id: "same-session", visitor_id: null,
      referrer_host: null, device_type: null, city: null, region: null, country: null };
    const result = summarizeAnalyticsEvents([
      { ...event, created_at: "2026-09-08T02:59:00Z" },
      { ...event, created_at: "2026-09-08T02:59:30Z" },
      { ...event, created_at: "2026-09-08T03:01:00Z" },
    ], new Date("2026-09-08T03:02:00Z"));
    expect(result.dailyVisits.slice(-2)).toEqual([
      { date: "2026-09-07T03:00:00.000Z", value: 1 },
      { date: "2026-09-08T03:00:00.000Z", value: 1 },
    ]);
  });
});
