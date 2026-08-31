import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

function envValue(value: string | undefined) {
  return value?.trim() ?? "";
}

export function isSupabasePublishableKey(value: string | undefined) {
  const key = envValue(value);
  return key.startsWith("sb_publishable_");
}

export function isForbiddenBrowserSupabaseKey(value: string | undefined) {
  const key = envValue(value);
  return (
    key.startsWith("sb_secret_") ||
    key.startsWith("eyJ") ||
    /service_role/i.test(key)
  );
}

export function isSupabaseConfigured() {
  const url = envValue(import.meta.env.VITE_SUPABASE_URL);
  const publishableKey = envValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  return Boolean(
    url &&
      isSupabasePublishableKey(publishableKey) &&
      !isForbiddenBrowserSupabaseKey(publishableKey),
  );
}

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) {
    return client;
  }

  const url = envValue(import.meta.env.VITE_SUPABASE_URL);
  const publishableKey = envValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  if (
    !url ||
    !isSupabasePublishableKey(publishableKey) ||
    isForbiddenBrowserSupabaseKey(publishableKey)
  ) {
    client = null;
    return client;
  }

  client = createClient(url, publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  });
  return client;
}
