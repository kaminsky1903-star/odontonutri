import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("vite dev server bind", () => {
  it("listens on IPv6 any-address so localhost ::1 is accepted", () => {
    const config = readFileSync(join(root, "vite.config.ts"), "utf8");

    expect(config).toMatch(/host:\s*"::"/);
    expect(config).toMatch(/port:\s*5173/);
    expect(config).toMatch(/strictPort:\s*true/);
  });
});
