import type { components } from "@/lib/api/generated";
import { parseApiProblem, type ApiProblem } from "@/lib/api-errors";

export type LoginInput = components["schemas"]["LoginRequest"];
export type ChangePasswordInput = components["schemas"]["ChangePasswordRequest"];
export type SessionEnvelope = components["schemas"]["SessionEnvelope"];
export type Session = components["schemas"]["Session"];

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
