interface Env {
  SUPABASE_HOST: string;
}

const PROXY_HOST = "api.colorcram.app";

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, apikey, x-client-info, content-type, range, x-supabase-api-version",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const origin = request.headers.get("Origin");

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
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
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      responseHeaders.set(key, value);
    }

    // Rewrite Location header on redirects so the browser stays on the proxy
    if (
      upstreamResponse.status >= 300 &&
      upstreamResponse.status < 400 &&
      responseHeaders.has("Location")
    ) {
      const location = responseHeaders.get("Location")!;
      responseHeaders.set(
        "Location",
        location.replace(env.SUPABASE_HOST, PROXY_HOST),
      );
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  },
} satisfies ExportedHandler<Env>;
