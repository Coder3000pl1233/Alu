import { ApiClientError, createApiClient, type LoginInput, type Session } from "@/lib/api/client";
import type { ApiProblem } from "@/lib/api-errors";

export type AuthResult = { session: Session };

export interface AuthGateway {
  login(input: LoginInput): Promise<AuthResult>;
  getCurrentSession(): Promise<AuthResult>;
  logout(): Promise<void>;
}

const DEMO_USER_ID = "27f55be0-4f16-4562-9d11-553ad4ab92d9";
const DEMO_DEVICE_ID = "60e746de-1887-49a1-91ea-b0768f8b1208";

const demoSession = (): Session => ({
  id: "63c4d00d-2df2-4d5f-beb6-6fcb030b12bc",
  user: {
    id: DEMO_USER_ID,
    name: "Lucía Fernández",
    email: "lucia.f@email.com",
    role: "student",
    status: "active",
    access_state: "active",
    access_until: "2026-08-25T23:59:59Z",
    must_change_password: false,
  },
  device_id: DEMO_DEVICE_ID,
  created_at: "2026-07-30T12:00:00Z",
  idle_expires_at: "2026-07-30T12:30:00Z",
  absolute_expires_at: "2026-08-06T12:00:00Z",
});

export function createDemoAuthGateway(): AuthGateway {
  return {
    async login() { return { session: demoSession() }; },
    async getCurrentSession() { return { session: demoSession() }; },
    async logout() {},
  };
}

export function createHttpAuthGateway(): AuthGateway {
  const client = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1" });
  return {
    async login(input) { return { session: (await client.login(input)).data }; },
    async getCurrentSession() { return { session: (await client.getCurrentSession()).data }; },
    logout: client.logout,
  };
}

export function getAuthMode() {
  return process.env.NEXT_PUBLIC_AUTH_MODE === "api" ? "api" : "demo";
}

export function createAuthGateway(): AuthGateway {
  return getAuthMode() === "api" ? createHttpAuthGateway() : createDemoAuthGateway();
}

export function problemFromAuthError(error: unknown): ApiProblem | null {
  return error instanceof ApiClientError ? error.problem : null;
}
