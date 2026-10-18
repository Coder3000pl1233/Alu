import { parseApiProblem, type ApiProblem } from "@/lib/api-errors";
import type { components } from "@/lib/api/generated";

export type LoginInput = components["schemas"]["LoginInput"];
export type RegisterInput = components["schemas"]["RegisterInput"];
export type ChangePasswordInput = { current_password: string; new_password: string };
export type SessionEnvelope = components["schemas"]["SessionEnvelope"];
export type Session = SessionEnvelope["data"];

type FetchLike = typeof fetch;

export class ApiClientError extends Error {
  readonly status: number;
  readonly problem: ApiProblem | null;

  constructor(status: number, problem: ApiProblem | null) {
    super(problem?.title ?? "La API devolvió una respuesta inesperada");
    this.name = "ApiClientError";
    this.status = status;
    this.problem = problem;
  }
}

export type ApiClientOptions = {
  baseUrl?: string;
  fetcher?: FetchLike;
};

export type MutationOptions = {
  idempotencyKey?: string;
};

function mutationHeaders(options?: MutationOptions) {
  return options?.idempotencyKey
    ? { "Idempotency-Key": options.idempotencyKey }
    : undefined;
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = (options.baseUrl ?? "/api/v1").replace(/\/$/, "");
  const fetcher = options.fetcher ?? fetch;

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetcher(`${baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json, application/problem+json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ApiClientError(response.status, parseApiProblem(body));
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }

  return {
    register(input: RegisterInput) { return request<{ message: string }>("/auth/register", { method: "POST", body: JSON.stringify(input) }); },
    requestVerification() { return request<void>("/auth/verification/request", { method: "POST" }); },
    verifyEmail(token: string) { return request<void>("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }); },
    requestPasswordReset(email: string) { return request<{ message: string }>("/auth/password-reset/request", { method: "POST", body: JSON.stringify({ email }) }); },
    resetPassword(token: string, password: string) { return request<void>("/auth/password-reset/confirm", { method: "POST", body: JSON.stringify({ token, password }) }); },
    login(input: LoginInput) {
      return request<SessionEnvelope>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    getCurrentSession() {
      return request<SessionEnvelope>("/auth/session");
    },
    logout() {
      return request<void>("/auth/logout", { method: "POST" });
    },
    changePassword(input: ChangePasswordInput, mutation?: MutationOptions) {
      return request<void>("/auth/password", {
        method: "POST",
        headers: mutationHeaders(mutation),
        body: JSON.stringify(input),
      });
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
