type WorkerEnv = {
  ASSETS?: Fetcher;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const canonical = canonicalPublicUrl(url);
    if (canonical) {
      return Response.redirect(canonical, 301);
    }
    if (
      url.pathname === "/api/admin/analytics" ||
      url.pathname.startsWith("/api/admin/")
    ) {
      return adminAnalyticsResponse(request);
    }
    if (url.pathname === "/api/geo") {
      return geoResponse(request);
    }
    if (url.pathname.startsWith("/api/")) {
      return Response.json({ name: "Odontología y Nutrición" });
    }
    if (env?.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<WorkerEnv>;

function isLocalHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".workers.dev")
  );
}

function canonicalPublicUrl(url: URL): string | null {
  if (isLocalHost(url.hostname)) {
    return null;
  }
  const needsHttps = url.protocol !== "https:";
  const needsWww = url.hostname === "odontonutri.com";
  if (!needsHttps && !needsWww) {
    return null;
  }
  const next = new URL(url.toString());
  next.protocol = "https:";
  if (needsWww) {
    next.hostname = "www.odontonutri.com";
  }
  return next.toString();
}

function geoResponse(request: Request) {
  const cf = "cf" in request ? request.cf : undefined;
  const raw = cf && typeof cf === "object" && "city" in cf ? cf.city : null;
  const city = approxCityFromCf(raw);
  return Response.json(
    { city },
    {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    },
  );
}

function approxCityFromCf(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const city = value.trim().replace(/\s+/g, " ").slice(0, 80);
  if (city.length < 2 || /[/?#@]/.test(city) || /https?:/i.test(city)) {
    return null;
  }
  return city;
}

function adminAnalyticsResponse(request: Request) {
  // Stage 2: verify the Bearer access token with the official Supabase JWKS
  // GET {SUPABASE_URL}/auth/v1/.well-known/jwks.json
  // Never put sb_secret_, service_role, or a JWT secret in VITE_ or this file.
  const headers = { "Cache-Control": "no-store" };
  const authorization = request.headers.get("Authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) {
    return Response.json({ error: "No autorizado" }, { status: 401, headers });
  }
  return Response.json(
    {
      status: "pending",
      message: "Analíticas pendientes de conexión",
    },
    { status: 503, headers },
  );
}
