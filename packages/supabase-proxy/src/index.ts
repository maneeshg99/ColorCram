interface Env {
  SUPABASE_HOST: string;
}

const PROXY_HOST = "api.colorcram.app";

function corsHeaders(origin: string | null, requestedHeaders?: string | null): Record<string, string> {
  // Allow the full set of headers that Supabase JS / PostgREST clients may send.
  // When the browser sends Access-Control-Request-Headers on preflight, echo
  // that back as well so we cover anything we didn't explicitly anticipate.
  const defaultHeaders = [
    "Authorization",
    "apikey",
    "x-client-info",
    "content-type",
    "range",
    "x-supabase-api-version",
    "accept-profile",
    "content-profile",
    "prefer",
    "x-client-version",
  ];
  const merged = requestedHeaders
    ? [...new Set([...defaultHeaders, ...requestedHeaders.split(",").map((h) => h.trim())])]
    : defaultHeaders;
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": merged.join(", "),
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Expose-Headers":
      "Content-Range, X-Total-Count, X-Supabase-Api-Version",
    "Vary": "Origin",
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const origin = request.headers.get("Origin");
    const requestedHeaders = request.headers.get("Access-Control-Request-Headers");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, requestedHeaders),
      });
    }

    const url = new URL(request.url);

    // Rewrite host from proxy to Supabase
    url.hostname = env.SUPABASE_HOST;
    url.port = "";
    url.protocol = "https:";

    // Build upstream request headers — pass everything through
    const headers = new Headers(request.headers);
    headers.set("Host", env.SUPABASE_HOST);

    // Handle WebSocket upgrade
    if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      return fetch(url.toString(), {
        method: request.method,
        headers,
        body: request.body,
      });
    }

    // Forward the request with manual redirect handling
    const upstreamResponse = await fetch(url.toString(), {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });

    // Build response headers
    const responseHeaders = new Headers(upstreamResponse.headers);

    // Add CORS headers
    for (const [key, value] of Object.entries(corsHeaders(origin, requestedHeaders))) {
      responseHeaders.set(key, value);
    }

    // Rewrite Location header on redirects — but only when the redirect
    // target itself is the Supabase host.  Don't rewrite redirects to
    // external OAuth providers (Google, Apple, etc.) because the
    // redirect_uri query param inside those URLs must stay as the real
    // Supabase callback URL that's registered in the provider's console.
    if (
      upstreamResponse.status >= 300 &&
      upstreamResponse.status < 400 &&
      responseHeaders.has("Location")
    ) {
      const location = responseHeaders.get("Location")!;
      try {
        const locUrl = new URL(location);
        if (locUrl.hostname === env.SUPABASE_HOST) {
          responseHeaders.set(
            "Location",
            location.replaceAll(env.SUPABASE_HOST, PROXY_HOST),
          );
        }
        // External redirects (Google, Apple OAuth) are left untouched
      } catch {
        // If Location isn't a valid URL, do a simple replace as fallback
        responseHeaders.set(
          "Location",
          location.replaceAll(env.SUPABASE_HOST, PROXY_HOST),
        );
      }
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  },
} satisfies ExportedHandler<Env>;
