import { describe, expect, it, vi } from "vitest";
import { ApiClientError, createApiClient } from "@/lib/api/client";

describe("typed api client", () => {
  it("envía cookies y interpreta una sesión tipada", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: { id: "session" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const client = createApiClient({ baseUrl: "https://api.aula.test/api/v1/", fetcher: fetcher as typeof fetch });

    const result = await client.getCurrentSession();

    expect(result.data.id).toBe("session");
    expect(fetcher).toHaveBeenCalledWith("https://api.aula.test/api/v1/auth/session", expect.objectContaining({ credentials: "include" }));
  });

  it("convierte application/problem+json en ApiClientError", async () => {
    const body = { type: "https://api.aula.test/problems/session-expired", title: "Sesión vencida", status: 401, code: "SESSION_EXPIRED", request_id: "9b191d15-c7f7-4b2a-97a0-190681a74fa8" };
    const client = createApiClient({ fetcher: vi.fn(async () => new Response(JSON.stringify(body), { status: 401 })) as typeof fetch });

    await expect(client.getCurrentSession()).rejects.toMatchObject<ApiClientError>({ status: 401, problem: body });
  });

  it("envía la clave de idempotencia en cambios de contraseña", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 204 }));
    const client = createApiClient({ fetcher: fetcher as typeof fetch });
    const key = "004dd67a-6c72-49ec-90f1-856b74bf7764";

    await client.changePassword({ current_password: "anterior", new_password: "Nueva-clave-segura-2026" }, { idempotencyKey: key });

    expect(fetcher).toHaveBeenCalledWith("/api/v1/auth/password", expect.objectContaining({ headers: expect.objectContaining({ "Idempotency-Key": key }) }));
  });
});
