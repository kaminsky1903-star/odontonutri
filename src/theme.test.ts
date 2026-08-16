import { afterEach, describe, expect, it } from "vitest";
import { THEME_KEY } from "./site";
import { applyTheme, isThemeMode, readTheme, resolvedTheme } from "./theme";

describe("theme", () => {
  afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("accepts only light, dark, and auto", () => {
    expect(isThemeMode("light")).toBe(true);
    expect(isThemeMode("dark")).toBe(true);
    expect(isThemeMode("auto")).toBe(true);
    expect(isThemeMode("system")).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });

  it("defaults to auto when nothing is stored", () => {
    expect(readTheme()).toBe("auto");
  });

  it("reads a stored theme", () => {
    localStorage.setItem(THEME_KEY, "dark");
    expect(readTheme()).toBe("dark");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem(THEME_KEY, "sepia");
    expect(readTheme()).toBe("auto");
  });

  it("resolves auto from the preferred color scheme", () => {
    expect(resolvedTheme("auto", () => true)).toBe("dark");
    expect(resolvedTheme("auto", () => false)).toBe("light");
    expect(resolvedTheme("dark", () => false)).toBe("dark");
    expect(resolvedTheme("light", () => true)).toBe("light");
  });

  it("applies the resolved theme to the document", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
