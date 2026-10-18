import type { User } from "@/lib/db/schema";
import type { MarketplaceListingStore } from "@/lib/marketplace/listing-store";
import { toPrivateListing, toPublicListing } from "@/lib/marketplace/types";

export class MarketplaceAccessError extends Error {
  constructor(readonly code: "AUTH_REQUIRED" | "ADMIN_REQUIRED" | "ACCOUNT_SUSPENDED" | "ACCOUNT_REVOKED" | "RESOURCE_NOT_FOUND", readonly status: 401 | 403 | 404) {
    super(code);
    this.name = "MarketplaceAccessError";
  }
}

function requireActiveUser(user: User | null) {
  if (!user) throw new MarketplaceAccessError("AUTH_REQUIRED", 401);
  if (user.status === "suspended") throw new MarketplaceAccessError("ACCOUNT_SUSPENDED", 403);
  if (user.status === "revoked") throw new MarketplaceAccessError("ACCOUNT_REVOKED", 403);
  return user;
}

export class MarketplaceListingService {
  constructor(private readonly store: MarketplaceListingStore) {}

  async listPublic(pageSize = 24) {
    return (await this.store.listPublished(pageSize)).filter(record => record.listing.status === "published").map(toPublicListing);
  }

  async getPublic(id: string) {
    const record = await this.store.findPublished(id);
    if (!record || record.listing.status !== "published") throw new MarketplaceAccessError("RESOURCE_NOT_FOUND", 404);
    return toPublicListing(record);
  }

  async listMine(user: User | null, pageSize = 24) {
    const actor = requireActiveUser(user);
    return (await this.store.listOwned(actor.id, pageSize)).filter(record => record.listing.sellerId === actor.id).map(toPrivateListing);
  }

  async getMine(user: User | null, id: string) {
    const actor = requireActiveUser(user);
    const record = await this.store.findOwned(id, actor.id);
    if (!record || record.listing.sellerId !== actor.id) throw new MarketplaceAccessError("RESOURCE_NOT_FOUND", 404);
    return toPrivateListing(record);
  }

  async getForAdmin(user: User | null, id: string) {
    const actor = requireActiveUser(user);
    if (actor.role !== "admin") throw new MarketplaceAccessError("ADMIN_REQUIRED", 403);
    const record = await this.store.findAny(id);
    if (!record) throw new MarketplaceAccessError("RESOURCE_NOT_FOUND", 404);
    return toPrivateListing(record);
  }
}
