import { and, eq, gt, isNull, sql } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { accountTokens, users } from "@/lib/db/schema";
import type { SellerAccountStore } from "@/lib/identity/seller-account-service";

export class PostgresSellerAccountStore implements SellerAccountStore {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string) {
    const [user] = await this.db.select().from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
    return user ?? null;
  }

  async createSeller(input: { name: string; email: string; passwordHash: string }) {
    const [user] = await this.db.insert(users).values({ ...input, role: "seller", mustChangePassword: false })
      .onConflictDoNothing().returning();
    return user ?? null;
  }

  async createToken(input: { userId: string; purpose: "verify" | "reset"; tokenHash: string; expiresAt: Date }) {
    await this.db.insert(accountTokens).values(input);
  }

  async consumeToken(input: { tokenHash: string; purpose: "verify" | "reset"; now: Date; passwordHash?: string }) {
    return this.db.transaction(async tx => {
      const [token] = await tx.update(accountTokens).set({ consumedAt: input.now }).where(and(
        eq(accountTokens.tokenHash, input.tokenHash), eq(accountTokens.purpose, input.purpose),
        isNull(accountTokens.consumedAt), gt(accountTokens.expiresAt, input.now),
      )).returning();
      if (!token) return false;
      if (input.purpose === "verify") {
        await tx.update(users).set({ emailVerifiedAt: input.now, updatedAt: input.now }).where(eq(users.id, token.userId));
      } else if (input.passwordHash) {
        await tx.update(users).set({ passwordHash: input.passwordHash, sessionVersion: sql`${users.sessionVersion} + 1`, updatedAt: input.now })
          .where(eq(users.id, token.userId));
      }
      return true;
    });
  }
}
