import { ApiClientError, createApiClient, type LoginInput, type RegisterInput, type Session } from "@/lib/api/client";
import type { ApiProblem } from "@/lib/api-errors";

export type AuthResult = { session: Session };

export interface AuthGateway {
  login(input: LoginInput): Promise<AuthResult>;
  register(input: RegisterInput): Promise<{ message: string }>;
  getCurrentSession(): Promise<AuthResult>;
  logout(): Promise<void>;
  requestVerification(): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  requestPasswordReset(email: string): Promise<{ message: string }>;
  resetPassword(token: string, password: string): Promise<void>;
}

export function createAuthGateway(): AuthGateway {
  const client = createApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1" });
  return {
    async login(input) { return { session: (await client.login(input)).data }; },
    register: client.register,
    async getCurrentSession() { return { session: (await client.getCurrentSession()).data }; },
    logout: client.logout,
    requestVerification: client.requestVerification,
    verifyEmail: client.verifyEmail,
    requestPasswordReset: client.requestPasswordReset,
    resetPassword: client.resetPassword,
  };
}

export function problemFromAuthError(error: unknown): ApiProblem | null {
  return error instanceof ApiClientError ? error.problem : null;
}
