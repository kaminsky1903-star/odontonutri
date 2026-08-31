import { SESSION_STORAGE_KEY, VISIT_FLAG_KEY } from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getAnonymousSessionId(): string | null {
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing && UUID_PATTERN.test(existing)) {
      return existing;
    }
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
  } catch {
    return null;
  }
}

export function consumeVisitFlag(): boolean {
  try {
    if (sessionStorage.getItem(VISIT_FLAG_KEY)) {
      return false;
    }
    sessionStorage.setItem(VISIT_FLAG_KEY, "1");
    return true;
  } catch {
    return false;
  }
}
