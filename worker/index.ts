export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === "odontonutri.com") {
      url.hostname = "www.odontonutri.com";
      return Response.redirect(url.toString(), 301);
    }
    if (
      url.pathname === "/api/admin/analytics" ||
      url.pathname.startsWith("/api/admin/")
    ) {
      return adminAnalyticsResponse(request);
    }
    if (url.pathname.startsWith("/api/")) {
      return Response.json({ name: "Odontología y Nutrición" });
    }
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler;

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
