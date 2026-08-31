import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../supabase/migrations/20260831134600_analytics_events.sql",
  ),
  "utf8",
);

describe("analytics events migration", () => {
  it("stores only non-sensitive site events with insert-only anonymous access", () => {
    expect(sql).toContain("create table if not exists public.analytics_events");
    expect(sql).toContain("enable row level security");
    expect(sql).toMatch(/grant insert on table public\.analytics_events to anon/i);
    expect(sql).toMatch(
      /revoke select, update, delete, truncate on table public\.analytics_events from anon/i,
    );
    expect(sql).toMatch(/for select\s+to authenticated/i);
    expect(sql).not.toMatch(/for select\s+to anon/i);
    expect(sql).toContain("whatsapp_click");
    expect(sql).toContain("phone_click");
    expect(sql).toContain("location_click");
    expect(sql).not.toMatch(
      /^\s*(password|email|nombre|paciente|historia_clinica|ip_address)\s+/im,
    );
    expect(sql).not.toContain("ip_address");
    expect(sql).not.toContain("user_agent");
  });
});
