import type { ListingRecord } from "@/lib/marketplace/types";

export interface MarketplaceListingStore {
  listPublished(pageSize: number): Promise<ListingRecord[]>;
  findPublished(id: string): Promise<ListingRecord | null>;
  listOwned(sellerId: string, pageSize: number): Promise<ListingRecord[]>;
  findOwned(id: string, sellerId: string): Promise<ListingRecord | null>;
  findAny(id: string): Promise<ListingRecord | null>;
}
