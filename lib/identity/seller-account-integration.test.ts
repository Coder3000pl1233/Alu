import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDatabase } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { IdentityService } from "@/lib/identity/identity-service";
import { PostgresIdentityStore } from "@/lib/identity/postgres-identity-store";
import { SellerAccountService, type AccountMailSender } from "@/lib/identity/seller-account-service";
import { PostgresSellerAccountStore } from "@/lib/identity/postgres-seller-account-store";
import { SessionService } from "@/lib/sessions/session-service";
import { PostgresSessionStore } from "@/lib/sessions/postgres-session-store";
import { buildApi, SESSION_COOKIE } from "@/server/app";

describe.skipIf(!process.env.DATABASE_URL)("punto 01 con PostgreSQL", () => {
  it("registra, verifica, inicia sesión, recupera clave e invalida la sesión antigua", async () => {
    const connection = createDatabase(process.env.DATABASE_URL!);
    const email = `${randomUUID()}@example.test`;
    const sent: Array<{ to: string; purpose: string; url: string }> = [];
    const mail: AccountMailSender = { async send(input) { sent.push(input); } };
    const app = buildApi({
      identity: new IdentityService(new PostgresIdentityStore(connection.db), { rateLimitPepper: "rate-limit-pepper-with-at-least-32-characters" }),
      sessions: new SessionService(new PostgresSessionStore(connection.db), { tokenPepper: "session-token-pepper-with-at-least-32-characters" }),
      sellerAccounts: new SellerAccountService(new PostgresSellerAccountStore(connection.db), mail, { appUrl: "http://localhost:3000" }),
    });
    const deviceId = randomUUID();
    const oldPassword = "Clave-inicial-2026!";
    const newPassword = "Clave-renovada-2026!";
    const post = (url: string, payload: object, cookie?: string) => app.inject({ method: "POST", url, payload, headers: cookie ? { cookie } : undefined });
    try {
      const register = await post("/api/v1/auth/register", { name: "Vendedor Prueba", email, password: oldPassword });
      expect(register.statusCode).toBe(202);
      expect((await post("/api/v1/auth/register", { name: "Vendedor Prueba", email, password: oldPassword })).statusCode).toBe(202);
      expect(sent).toHaveLength(1);
      const [created] = await connection.db.select().from(users).where(eq(users.email, email));
      expect(created).toMatchObject({ role: "seller", emailVerifiedAt: null });
      expect(created.passwordHash).not.toBe(oldPassword);

      const login = await post("/api/v1/auth/login", { email, password: oldPassword, device_id: deviceId, device_name: "Prueba" });
      expect(login.statusCode).toBe(200);
      expect(login.json().data.user.email_verified).toBe(false);
      const cookie = String(login.headers["set-cookie"]).split(";")[0];
      expect(cookie).toContain(SESSION_COOKIE);
      expect((await post("/api/v1/auth/verification/request", {}, cookie)).statusCode).toBe(202);

      const verifyToken = new URL(sent.at(-1)!.url).searchParams.get("token")!;
      expect((await post("/api/v1/auth/verify-email", { token: verifyToken })).statusCode).toBe(204);
      expect((await post("/api/v1/auth/verify-email", { token: verifyToken })).json().code).toBe("TOKEN_INVALID");
      expect((await connection.db.select().from(users).where(eq(users.email, email)))[0].emailVerifiedAt).not.toBeNull();

      expect((await post("/api/v1/auth/password-reset/request", { email: "nobody@example.test" })).statusCode).toBe(202);
      expect((await post("/api/v1/auth/password-reset/request", { email })).statusCode).toBe(202);
      const resetToken = new URL(sent.at(-1)!.url).searchParams.get("token")!;
      expect((await post("/api/v1/auth/password-reset/confirm", { token: resetToken, password: newPassword })).statusCode).toBe(204);
      expect((await app.inject({ method: "GET", url: "/api/v1/auth/session", headers: { cookie } })).statusCode).toBe(403);
      expect((await post("/api/v1/auth/login", { email, password: oldPassword, device_id: deviceId, device_name: "Prueba" })).statusCode).toBe(401);
      const newLogin = await post("/api/v1/auth/login", { email, password: newPassword, device_id: deviceId, device_name: "Prueba" });
      expect(newLogin.json().data.user.email_verified).toBe(true);
      const newCookie = String(newLogin.headers["set-cookie"]).split(";")[0];
      expect((await post("/api/v1/auth/logout", {}, newCookie)).statusCode).toBe(204);
      expect((await app.inject({ method: "GET", url: "/api/v1/auth/session", headers: { cookie: newCookie } })).statusCode).toBe(403);
    } finally {
      await connection.db.delete(users).where(eq(users.email, email));
      await app.close();
      await connection.close();
    }
  });
});
