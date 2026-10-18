import { describe, expect, it, vi } from "vitest";
import type { Listing, User } from "@/lib/db/schema";
import { SessionError } from "@/lib/sessions/session-service";
import { createHttpMarketplaceGateway } from "@/lib/marketplace/gateway";
import { MarketplaceListingService } from "@/lib/marketplace/listing-service";
import type { MarketplaceListingStore } from "@/lib/marketplace/listing-store";
import type { ListingRecord } from "@/lib/marketplace/types";
import { buildApi } from "@/server/app";

const sellerId = "52575fd3-c321-4b88-9b06-099c5d8c3d0d";
const publishedId = "804fdc3d-6a4e-4936-8d3b-3a37745457f0";
const draftId = "26c77d5b-8d23-4ebf-a960-2e4a1bd5d603";
const otherId = "519396d4-b2b2-4f8e-a918-300353a61691";

function user(id: string, role: User["role"] = "seller"): User {
  return { id, name: "Vendedor", email: `${id}@example.test`, role, status: "active", emailVerifiedAt: null, accessUntil: null,
    passwordHash: "hash", mustChangePassword: false, sessionVersion: 1, suspendedAt: null,
    revokedAt: null, createdAt: new Date(), updatedAt: new Date() };
}

function record(id: string, status: Listing["status"], owner = sellerId): ListingRecord {
  return {
    listing: { id, sellerId: owner, subjectId: null, universityId: null, title: "Apunte de Anatomía",
      description: "Resumen completo", type: "note", priceArs: 2500, fullPageCount: 60,
      whatsappNumber: "+5491112345678", contactConsent: true, status, revision: 1,
      submittedAt: null, publishedAt: status === "published" ? new Date("2026-10-01T12:00:00Z") : null,
      createdAt: new Date("2026-09-30T12:00:00Z"), updatedAt: new Date("2026-10-01T12:00:00Z") },
    subject: { id: "f6b721c6-cb04-4a1b-986e-efb0d0d89f55", name: "Anatomía", slug: "anatomia" },
    university: null,
    seller: { id: owner, name: "Vendedor" },
  };
}

const records = [record(publishedId, "published"), record(draftId, "draft"), record(otherId, "draft", otherId)];
const store: MarketplaceListingStore = {
  listPublished: async () => records.filter(item => item.listing.status === "published"),
  findPublished: async id => records.find(item => item.listing.id === id && item.listing.status === "published") ?? null,
  listOwned: async owner => records.filter(item => item.listing.sellerId === owner),
  findOwned: async (id, owner) => records.find(item => item.listing.id === id && item.listing.sellerId === owner) ?? null,
  findAny: async id => records.find(item => item.listing.id === id) ?? null,
};

function setup(actor: User | null = null) {
  const sessions = { resolve: vi.fn(async () => {
    if (!actor) throw new SessionError("AUTH_REQUIRED", 401);
    return { user: actor };
  }) };
  const app = buildApi({ identity: {} as never, sessions: sessions as never, marketplace: new MarketplaceListingService(store) });
  const fetcher = async (input: RequestInfo | URL) => {
    const response = await app.inject({ method: "GET", url: String(input) });
    return new Response(response.body, { status: response.statusCode, headers: { "content-type": String(response.headers["content-type"]) } });
  };
  return { app, gateway: createHttpMarketplaceGateway({ baseUrl: "http://localhost/api/v1", fetcher: fetcher as typeof fetch }), sessions };
}

describe("punto 00: API y cliente del marketplace", () => {
  it("lee el mismo registro y campos por API y cliente, sin publicar borradores ni contacto privado", async () => {
    const { app, gateway } = setup();
    try {
      const list = await gateway.listPublic();
      expect(list.map(item => item.id)).toEqual([publishedId]);
      const detail = await gateway.getPublic(publishedId);
      expect(detail).toEqual(list[0]);
      expect(detail).toMatchObject({ title: "Apunte de Anatomía", price_ars: 2500, subject: { slug: "anatomia" } });
      expect(detail).not.toHaveProperty("whatsapp_number");
      await expect(gateway.getPublic(draftId)).rejects.toMatchObject({ status: 404 });
    } finally { await app.close(); }
  });

  it("protege los borradores por propietario y reserva la lectura global al administrador", async () => {
    const unauthenticated = setup();
    try {
      const response = await unauthenticated.app.inject({ method: "GET", url: `/api/v1/me/listings/${draftId}` });
      expect(response.statusCode).toBe(401);
      expect(response.json()).toMatchObject({ type: "about:blank", code: "AUTH_REQUIRED", request_id: expect.any(String) });
    } finally { await unauthenticated.app.close(); }

    const owner = setup(user(sellerId));
    try {
      expect((await owner.gateway.getMine(draftId)).status).toBe("draft");
      expect((await owner.gateway.listMine()).map(item => item.id)).toEqual([publishedId, draftId]);
      await expect(owner.gateway.getMine(otherId)).rejects.toMatchObject({ status: 404 });
      await expect(owner.gateway.getForAdmin(otherId)).rejects.toMatchObject({ status: 403 });
    } finally { await owner.app.close(); }

    const admin = setup(user("742e7a94-c859-4ea2-a4da-5eeb002667e5", "admin"));
    try { expect((await admin.gateway.getForAdmin(otherId)).id).toBe(otherId); }
    finally { await admin.app.close(); }
  });

  it("devuelve errores de validación con el formato del contrato", async () => {
    const { app } = setup();
    try {
      const response = await app.inject({ method: "GET", url: "/api/v1/listings?page_size=0" });
      expect(response.statusCode).toBe(400);
      expect(response.headers["content-type"]).toContain("application/problem+json");
      expect(response.json()).toMatchObject({ type: "about:blank", code: "VALIDATION_FAILED", request_id: expect.any(String) });
    } finally { await app.close(); }
  });
});
