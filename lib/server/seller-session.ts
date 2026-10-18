import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Session } from "@/lib/api/client";
import { getApi } from "@/lib/server/api-runtime";
import { SESSION_COOKIE } from "@/server/app";

export async function requireSellerSession(nextPath: string): Promise<Session> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const api = await getApi();
  const response = await api.inject({ method: "GET", url: "/api/v1/auth/session", headers: { cookie: `${SESSION_COOKIE}=${token}` } });
  if (response.statusCode !== 200) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const session = (response.json() as { data: Session }).data;
  if (session.user.role !== "seller" || session.user.status !== "active") redirect("/app");
  return session;
}
