import type { components } from "@/lib/api/generated";
import { ApiClientError } from "@/lib/api/client";
import { parseApiProblem } from "@/lib/api-errors";

export type MarketplacePublicListing = components["schemas"]["PublicListing"];
export type MarketplacePrivateListing = components["schemas"]["PrivateListing"];

export interface MarketplaceGateway {
  listPublic(pageSize?: number): Promise<MarketplacePublicListing[]>;
  getPublic(id: string): Promise<MarketplacePublicListing>;
  listMine(pageSize?: number): Promise<MarketplacePrivateListing[]>;
  getMine(id: string): Promise<MarketplacePrivateListing>;
  getForAdmin(id: string): Promise<MarketplacePrivateListing>;
}

export function createHttpMarketplaceGateway(options: { baseUrl?: string; fetcher?: typeof fetch } = {}): MarketplaceGateway {
  const baseUrl = (options.baseUrl ?? "/api/v1").replace(/\/$/, "");
  const fetcher = options.fetcher ?? fetch;

  async function get<T>(path: string): Promise<T> {
    const response = await fetcher(`${baseUrl}${path}`, {
      credentials: "include",
      headers: { Accept: "application/json, application/problem+json" },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ApiClientError(response.status, parseApiProblem(body));
    }
    return response.json() as Promise<T>;
  }

  const pageQuery = (pageSize?: number) => pageSize === undefined ? "" : `?page_size=${encodeURIComponent(pageSize)}`;

  return {
    async listPublic(pageSize) {
      return (await get<components["schemas"]["PublicListingPage"]>(`/listings${pageQuery(pageSize)}`)).data;
    },
    async getPublic(id) {
      return (await get<components["schemas"]["PublicListingEnvelope"]>(`/listings/${encodeURIComponent(id)}`)).data;
    },
    async listMine(pageSize) {
      return (await get<components["schemas"]["PrivateListingPage"]>(`/me/listings${pageQuery(pageSize)}`)).data;
    },
    async getMine(id) {
      return (await get<components["schemas"]["PrivateListingEnvelope"]>(`/me/listings/${encodeURIComponent(id)}`)).data;
    },
    async getForAdmin(id) {
      return (await get<components["schemas"]["PrivateListingEnvelope"]>(`/admin/listings/${encodeURIComponent(id)}`)).data;
    },
  };
}
