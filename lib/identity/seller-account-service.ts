import { createHash, randomBytes } from "node:crypto";
import type { User } from "@/lib/db/schema";
import { hashPassword, type PasswordPolicy } from "@/lib/security/passwords";

export type AccountTokenPurpose = "verify" | "reset";
export type AccountTokenRecord = { userId: string; expiresAt: Date; consumedAt: Date | null };

export interface SellerAccountStore {
  findByEmail(email: string): Promise<User | null>;
  createSeller(input: { name: string; email: string; passwordHash: string }): Promise<User | null>;
  createToken(input: { userId: string; purpose: AccountTokenPurpose; tokenHash: string; expiresAt: Date }): Promise<void>;
  consumeToken(input: { tokenHash: string; purpose: AccountTokenPurpose; now: Date; passwordHash?: string }): Promise<boolean>;
}

export interface AccountMailSender {
  send(input: { to: string; purpose: AccountTokenPurpose; url: string }): Promise<void>;
}

export class SellerAccountError extends Error {
  constructor(readonly code: "VALIDATION_FAILED" | "TOKEN_INVALID" | "ACCOUNT_SUSPENDED" | "ACCOUNT_REVOKED", readonly status: 400 | 403) {
    super(code);
    this.name = "SellerAccountError";
  }
}

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export class SellerAccountService {
  constructor(private readonly store: SellerAccountStore, private readonly mail: AccountMailSender,
    private readonly options: { appUrl: string; now?: () => Date; passwordPolicy?: PasswordPolicy }) {}

  private now() { return this.options.now?.() ?? new Date(); }

  private async issue(user: User, purpose: AccountTokenPurpose) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(this.now().getTime() + (purpose === "verify" ? 24 * 60 * 60_000 : 30 * 60_000));
    await this.store.createToken({ userId: user.id, purpose, tokenHash: tokenHash(token), expiresAt });
    const path = purpose === "verify" ? "/verificar-correo" : "/restablecer-clave";
    await this.mail.send({ to: user.email, purpose, url: `${this.options.appUrl.replace(/\/$/, "")}${path}?token=${encodeURIComponent(token)}` });
  }

  async register(input: { name: string; email: string; password: string }) {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new SellerAccountError("VALIDATION_FAILED", 400);
    }
    const passwordHash = await hashPassword(input.password, this.options.passwordPolicy);
    const user = await this.store.createSeller({ name, email, passwordHash });
    if (user) await this.issue(user, "verify");
  }

  async requestVerification(user: User) {
    if (user.status === "suspended") throw new SellerAccountError("ACCOUNT_SUSPENDED", 403);
    if (user.status === "revoked") throw new SellerAccountError("ACCOUNT_REVOKED", 403);
    if (!user.emailVerifiedAt) await this.issue(user, "verify");
  }

  async verify(token: string) {
    if (!token || token.length > 256 || !await this.store.consumeToken({ tokenHash: tokenHash(token), purpose: "verify", now: this.now() })) {
      throw new SellerAccountError("TOKEN_INVALID", 400);
    }
  }

  async requestReset(email: string) {
    const user = await this.store.findByEmail(email.trim().toLowerCase());
    if (user?.role === "seller" && user.status === "active") await this.issue(user, "reset");
  }

  async resetPassword(token: string, password: string) {
    if (!token || token.length > 256) throw new SellerAccountError("TOKEN_INVALID", 400);
    const passwordHash = await hashPassword(password, this.options.passwordPolicy);
    if (!await this.store.consumeToken({ tokenHash: tokenHash(token), purpose: "reset", now: this.now(), passwordHash })) {
      throw new SellerAccountError("TOKEN_INVALID", 400);
    }
  }
}
