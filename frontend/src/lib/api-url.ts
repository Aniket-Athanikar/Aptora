/**
 * Aptora — API URL Resolver
 * Ensures robust resolution of API endpoints without double /api/ prefixes
 * and falls back gracefully from internal Docker hostnames to browser window origin.
 */

export function resolveApiUrl(endpoint: string): string {
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();

  if (typeof window !== "undefined") {
    if (!base.startsWith("http://") && !base.startsWith("https://")) {
      const origin = window.location.origin;
      const prefix = base.startsWith("/") ? base : `/${base}`;
      base = `${origin}${prefix === "/" ? "" : prefix}`;
    } else {
      try {
        const u = new URL(base);
        if (u.hostname === "api" || u.hostname === "backend") {
          base = `${window.location.origin}${u.pathname}`;
        }
      } catch {}
    }
  }

  let cleanBase = base.replace(/\/+$/, "");

  if (cleanBase.endsWith("/api") && (cleanEndpoint.startsWith("/api/") || cleanEndpoint === "/api")) {
    cleanEndpoint = cleanEndpoint === "/api" ? "" : cleanEndpoint.substring(4);
  } else if (!cleanBase.endsWith("/api") && !cleanEndpoint.startsWith("/api/") && cleanEndpoint !== "/api") {
    cleanEndpoint = `/api${cleanEndpoint}`;
  }

  let fullUrl = `${cleanBase}${cleanEndpoint}`;
  fullUrl = fullUrl.replace(/\/api\/api\//g, "/api/").replace(/\/api\/api$/g, "/api");

  return fullUrl;
}
