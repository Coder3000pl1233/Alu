import { getApi } from "@/lib/server/api-runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  const api = await getApi();
  const url = new URL(request.url);
  const payload = request.method === "GET" || request.method === "HEAD" ? undefined : Buffer.from(await request.arrayBuffer());
  const response = await api.inject({ method: request.method as "GET", url: `${url.pathname}${url.search}`, headers: Object.fromEntries(request.headers), payload });
  const headers = new Headers();
  for (const [key, value] of Object.entries(response.headers)) {
    if (key === "content-length" || value === undefined) continue;
    if (Array.isArray(value)) value.forEach(item => headers.append(key, String(item)));
    else headers.set(key, String(value));
  }
  return new Response([204, 205, 304].includes(response.statusCode) ? null : response.body, { status: response.statusCode, headers });
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
