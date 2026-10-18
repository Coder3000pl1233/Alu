import { and, desc, eq } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { listings, marketplaceSubjects, marketplaceUniversities, users } from "@/lib/db/schema";
import type { MarketplaceListingStore } from "@/lib/marketplace/listing-store";
import type { ListingRecord } from "@/lib/marketplace/types";

export class PostgresMarketplaceListingStore implements MarketplaceListingStore {
  constructor(private readonly db: Database) {}

  private baseQuery() {
    return this.db.select({
      listing: listings,
      subject: marketplaceSubjects,
      university: marketplaceUniversities,
      seller: { id: users.id, name: users.name },
    }).from(listings)
      .innerJoin(users, eq(listings.sellerId, users.id))
      .leftJoin(marketplaceSubjects, eq(listings.subjectId, marketplaceSubjects.id))
      .leftJoin(marketplaceUniversities, eq(listings.universityId, marketplaceUniversities.id));
  }

  async listPublished(pageSize: number): Promise<ListingRecord[]> {
    return this.baseQuery().where(eq(listings.status, "published"))
      .orderBy(desc(listings.publishedAt), desc(listings.id)).limit(pageSize);
  }

  async findPublished(id: string): Promise<ListingRecord | null> {
    const [record] = await this.baseQuery().where(and(eq(listings.id, id), eq(listings.status, "published"))).limit(1);
    return record ?? null;
  }

  async listOwned(sellerId: string, pageSize: number): Promise<ListingRecord[]> {
    return this.baseQuery().where(eq(listings.sellerId, sellerId))
      .orderBy(desc(listings.updatedAt), desc(listings.id)).limit(pageSize);
  }

  async findOwned(id: string, sellerId: string): Promise<ListingRecord | null> {
    const [record] = await this.baseQuery().where(and(eq(listings.id, id), eq(listings.sellerId, sellerId))).limit(1);
    return record ?? null;
  }

  async findAny(id: string): Promise<ListingRecord | null> {
    const [record] = await this.baseQuery().where(eq(listings.id, id)).limit(1);
    return record ?? null;
  }
}
