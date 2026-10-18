import "server-only";
import { createDatabase } from "@/lib/db/client";
import { IdentityService } from "@/lib/identity/identity-service";
import { PostgresIdentityStore } from "@/lib/identity/postgres-identity-store";
import { SellerAccountService } from "@/lib/identity/seller-account-service";
import { PostgresSellerAccountStore } from "@/lib/identity/postgres-seller-account-store";
import { localMailSender } from "@/lib/identity/local-mailbox";
import { PostgresMarketplaceListingStore } from "@/lib/marketplace/postgres-listing-store";
import { MarketplaceListingService } from "@/lib/marketplace/listing-service";
import { SessionService } from "@/lib/sessions/session-service";
import { PostgresSessionStore } from "@/lib/sessions/postgres-session-store";
import { buildApi } from "@/server/app";

type Api = Awaited<ReturnType<typeof buildApi>>;
let apiPromise: Promise<Api> | undefined;

export function getApi() {
  apiPromise ??= (async () => {
    const databaseUrl = process.env.DATABASE_URL;
    const rateLimitPepper = process.env.RATE_LIMIT_PEPPER;
    const tokenPepper = process.env.SESSION_TOKEN_PEPPER;
    if (!databaseUrl || !rateLimitPepper || !tokenPepper) throw new Error("DATABASE_URL y los secretos de sesión deben estar configurados");
    const { db } = createDatabase(databaseUrl);
    const api = buildApi({
      identity: new IdentityService(new PostgresIdentityStore(db), { rateLimitPepper }),
      sessions: new SessionService(new PostgresSessionStore(db), { tokenPepper }),
      sellerAccounts: new SellerAccountService(new PostgresSellerAccountStore(db), localMailSender, {
        appUrl: process.env.APP_URL ?? "http://localhost:3000",
      }),
      marketplace: new MarketplaceListingService(new PostgresMarketplaceListingStore(db)),
    });
    await api.ready();
    return api;
  })().catch(error => { apiPromise = undefined; throw error; });
  return apiPromise!;
}
