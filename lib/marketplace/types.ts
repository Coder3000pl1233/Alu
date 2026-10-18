import type { Listing } from "@/lib/db/schema";

export type ListingStatus = Listing["status"];
export type ListingKind = NonNullable<Listing["type"]>;

export type CatalogItem = { id: string; name: string; slug: string };

export type ListingRecord = {
  listing: Listing;
  subject: CatalogItem | null;
  university: CatalogItem | null;
  seller: { id: string; name: string };
};

export type PublicListing = {
  id: string;
  title: string;
  description: string | null;
  type: ListingKind | null;
  price_ars: number | null;
  full_page_count: number | null;
  subject: CatalogItem | null;
  university: CatalogItem | null;
  seller: { id: string; name: string };
  published_at: string | null;
  updated_at: string;
};

export type PrivateListing = PublicListing & {
  seller_id: string;
  status: ListingStatus;
  revision: number;
  whatsapp_number: string | null;
  contact_consent: boolean;
  submitted_at: string | null;
};

export function toPublicListing(record: ListingRecord): PublicListing {
  const { listing, subject, university, seller } = record;
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    type: listing.type,
    price_ars: listing.priceArs,
    full_page_count: listing.fullPageCount,
    subject,
    university,
    seller,
    published_at: listing.publishedAt?.toISOString() ?? null,
    updated_at: listing.updatedAt.toISOString(),
  };
}

export function toPrivateListing(record: ListingRecord): PrivateListing {
  return {
    ...toPublicListing(record),
    seller_id: record.listing.sellerId,
    status: record.listing.status,
    revision: record.listing.revision,
    whatsapp_number: record.listing.whatsappNumber,
    contact_consent: record.listing.contactConsent,
    submitted_at: record.listing.submittedAt?.toISOString() ?? null,
  };
}
