import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { createDatabase } from "@/lib/db/client";
import { listings, users } from "@/lib/db/schema";
import { createHttpMarketplaceGateway } from "@/lib/marketplace/gateway";
import { MarketplaceListingService } from "@/lib/marketplace/listing-service";
import { PostgresMarketplaceListingStore } from "@/lib/marketplace/postgres-listing-store";
import { buildApi } from "@/server/app";

describe.skipIf(!process.env.DATABASE_URL)("punto 00 con PostgreSQL", () => {
  it("persiste una publicación, conserva sus campos hasta el cliente y excluye borradores", async () => {
    const connection = createDatabase(process.env.DATABASE_URL!);
    const sellerId = randomUUID();
    const publishedId = randomUUID();
    const draftId = randomUUID();
    const app = buildApi({
      identity: {} as never,
      sessions: {} as never,
      marketplace: new MarketplaceListingService(new PostgresMarketplaceListingStore(connection.db)),
    });
    const gateway = createHttpMarketplaceGateway({
      baseUrl: "http://localhost/api/v1",
      fetcher: (async (input: RequestInfo | URL) => {
        const response = await app.inject({ method: "GET", url: String(input) });
        return new Response(response.body, { status: response.statusCode });
      }) as typeof fetch,
    });

    try {
      await connection.db.insert(users).values({ id: sellerId, name: "Prueba MVP 00", email: `${sellerId}@example.test`, role: "seller", passwordHash: "test-only" });
      await connection.db.insert(listings).values([
        { id: publishedId, sellerId, title: "Anatomía persistida", type: "note", priceArs: 2500, status: "published", publishedAt: new Date() },
        { id: draftId, sellerId, title: "Borrador privado", status: "draft" },
      ]);
      const published = await gateway.getPublic(publishedId);
      expect(published).toMatchObject({ id: publishedId, title: "Anatomía persistida", type: "note", price_ars: 2500, seller: { id: sellerId } });
      expect((await gateway.listPublic()).some(item => item.id === publishedId)).toBe(true);
      expect((await gateway.listPublic()).some(item => item.id === draftId)).toBe(false);
      await expect(gateway.getPublic(draftId)).rejects.toMatchObject({ status: 404 });
    } finally {
      await connection.db.delete(listings).where(eq(listings.sellerId, sellerId));
      await connection.db.delete(users).where(eq(users.id, sellerId));
      await app.close();
      await connection.close();
    }
  });
});
