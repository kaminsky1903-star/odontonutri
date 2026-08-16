import { THEME_KEY, type ThemeMode } from "./site";

export function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "auto";
}

export function readTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (isThemeMode(stored)) {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "auto";
}

export function resolvedTheme(
  mode: ThemeMode,
  prefersDark = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches,
): "light" | "dark" {
  if (mode === "auto") {
    return prefersDark() ? "dark" : "light";
  }
  return mode;
}

export function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = resolvedTheme(mode);
}
