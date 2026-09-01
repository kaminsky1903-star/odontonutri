import {
  ADMIN_ROBOTS,
  applyPageMetadata,
  isHtmlShellPath,
  metadataForPath,
} from "../src/seo";

type WorkerEnv = {
  ASSETS?: Fetcher;
};

const NOT_FOUND_HTML = `<!doctype html>
<html lang="es-AR">
  <head>
    <meta charset="utf-8" />
    <title>Página no encontrada | Odontología y Nutrición</title>
    <meta name="robots" content="noindex, nofollow" />
  </head>
  <body>
    <h1>Página no encontrada</h1>
    <p><a href="https://www.odontonutri.com/">Volver al inicio</a></p>
  </body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const canonical = canonicalPublicUrl(url, request);
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
    if (isHtmlShellPath(url.pathname)) {
      return htmlShellResponse(request, env);
    }
    if (env?.ASSETS) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status === 404 && isMissingDocument(url, request)) {
        return notFoundResponse();
      }
      return asset;
    }
    return notFoundResponse();
  },
} satisfies ExportedHandler<WorkerEnv>;

function isLocalHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".workers.dev")
  );
}

function requestHost(url: URL, request: Request) {
  const header = request.headers.get("Host") ?? "";
  return (header.split(":")[0] || url.hostname).toLowerCase();
}

function isLocalPreview(url: URL, request: Request) {
  if (isLocalHost(url.hostname) || isLocalHost(requestHost(url, request))) {
    return true;
  }
  const connecting = request.headers.get("CF-Connecting-IP") ?? "";
  if (connecting === "127.0.0.1" || connecting === "::1") {
    return true;
  }
  const forwarded = (request.headers.get("X-Forwarded-For") ?? "")
    .split(",")[0]
    ?.trim();
  return forwarded === "127.0.0.1" || forwarded === "::1";
}

function isProductionHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "odontonutri.com" || host === "www.odontonutri.com";
}

function hasCustomDevPort(url: URL) {
  return url.port !== "" && url.port !== "80" && url.port !== "443";
}

function canonicalPublicUrl(url: URL, request: Request): string | null {
  const next = new URL(url.toString());
  let changed = false;
  if (isProductionHost(url.hostname) && !hasCustomDevPort(url) && !isLocalPreview(url, request)) {
    if (next.protocol !== "https:") {
      next.protocol = "https:";
      changed = true;
    }
    if (next.hostname === "odontonutri.com") {
      next.hostname = "www.odontonutri.com";
      changed = true;
    }
  }
  if (next.pathname === "/index.html") {
    next.pathname = "/";
    changed = true;
  }
  if (next.pathname === "/odontologia/" || next.pathname === "/nutricion/") {
    next.pathname = next.pathname.slice(0, -1);
    changed = true;
  }
  return changed ? next.toString() : null;
}

function isMissingDocument(url: URL, request: Request) {
  const accept = request.headers.get("Accept") ?? "";
  if (accept.includes("text/html")) {
    return true;
  }
  const last = url.pathname.split("/").pop() ?? "";
  return last !== "" && !last.includes(".");
}

async function htmlShellResponse(request: Request, env: WorkerEnv) {
  const page = metadataForPath(new URL(request.url).pathname);
  if (!page || !env?.ASSETS) {
    return notFoundResponse();
  }
  const shell = await fetchSpaShell(request, env.ASSETS);
  if (!shell.ok) {
    return notFoundResponse();
  }
  const html = applyPageMetadata(await shell.text(), page);
  const headers = new Headers(shell.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.delete("ETag");
  headers.delete("Last-Modified");
  if (page.robots === ADMIN_ROBOTS) {
    headers.set("X-Robots-Tag", ADMIN_ROBOTS);
  }
  return new Response(html, { status: 200, headers });
}

async function fetchSpaShell(request: Request, assets: Fetcher) {
  const headers = new Headers(request.headers);
  headers.delete("if-none-match");
  headers.delete("if-modified-since");
  const indexRequest = new Request(new URL("/index.html", request.url), {
    method: "GET",
    headers,
  });
  const indexed = await assets.fetch(indexRequest);
  if (indexed.ok) {
    return indexed;
  }
  return assets.fetch(
    new Request(new URL("/", request.url), { method: "GET", headers }),
  );
}

function notFoundResponse() {
  return new Response(NOT_FOUND_HTML, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
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
