import "server-only";
import { appendFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { AccountMailSender } from "@/lib/identity/seller-account-service";

const mailboxPath = () => join(process.cwd(), ".local-mailbox.jsonl");
export type LocalMail = { to: string; purpose: "verify" | "reset"; url: string; createdAt: string };

export const localMailSender: AccountMailSender = {
  async send(input) {
    if (process.env.NODE_ENV === "production") throw new Error("Email delivery is not configured");
    await appendFile(mailboxPath(), `${JSON.stringify({ ...input, createdAt: new Date().toISOString() })}\n`, { encoding: "utf8", mode: 0o600 });
  },
};

export async function readLocalMailbox(): Promise<LocalMail[]> {
  try {
    return (await readFile(mailboxPath(), "utf8")).trim().split("\n").filter(Boolean)
      .map(line => JSON.parse(line) as LocalMail).reverse().slice(0, 30);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
