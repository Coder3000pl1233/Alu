import { createHash } from "node:crypto";
import sharp from "sharp";
import type { DerivedPageInput, DocumentStore } from "@/lib/documents/document-store";
import type { PrivateObjectStorage } from "@/lib/storage/object-storage";
import type { PageRasterizer } from "@/worker/rasterizer";

const sha256 = (value: Uint8Array) => createHash("sha256").update(value).digest("hex");

export class DocumentProcessor {
  constructor(private readonly store: DocumentStore, private readonly storage: PrivateObjectStorage, private readonly rasterizer: PageRasterizer, private readonly now = () => new Date()) {}

  async process(jobId: string) {
    const claimed = await this.store.claimJob(jobId, this.now());
    if (!claimed) return;
    const uploaded: string[] = [];
    try {
      const original = await this.storage.getPrivate(claimed.document.originalKey);
      if (sha256(original.body) !== claimed.document.originalSha256) throw new Error("original_integrity_mismatch");
      const rasterized = await this.rasterizer.rasterize(original.body);
      const pages: DerivedPageInput[] = [];

      for (const page of rasterized) {
        const normal = await sharp(page.png).resize({ width: 1_200, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
        const high = await sharp(page.png).resize({ width: 1_800, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
        const normalMeta = await sharp(normal).metadata();
        const highMeta = await sharp(high).metadata();
        const variants = [
          { variant: "master" as const, bytes: page.png, contentType: "image/png", extension: "png", width: page.width, height: page.height },
          { variant: "normal" as const, bytes: normal, contentType: "image/webp", extension: "webp", width: normalMeta.width!, height: normalMeta.height! },
          { variant: "high" as const, bytes: high, contentType: "image/webp", extension: "webp", width: highMeta.width!, height: highMeta.height! },
        ];
        for (const variant of variants) {
          const key = `documents/${claimed.document.id}/private/${variant.variant}/page-${String(page.pageNumber).padStart(4, "0")}.${variant.extension}`;
          const hash = sha256(variant.bytes);
          await this.storage.putPrivate(key, variant.bytes, variant.contentType, { sha256: hash, document_id: claimed.document.id, page: String(page.pageNumber), variant: variant.variant });
          uploaded.push(key);
          pages.push({ pageNumber: page.pageNumber, variant: variant.variant, storageKey: key, sha256: hash, byteSize: variant.bytes.byteLength, width: variant.width, height: variant.height });
        }
      }

      await this.store.publishProcessed(jobId, claimed.document.id, pages, rasterized.length, this.now());
    } catch (error) {
      await Promise.allSettled(uploaded.map((key) => this.storage.deletePrivate(key)));
      const message = error instanceof Error ? error.message : "unknown";
      const rejected = message.includes("page_limit") || message.includes("no_pages") || message.includes("rasterizer_failed");
      const safeCode = rejected ? "DOCUMENT_REJECTED" : message.includes("timeout") ? "PROCESSING_TIMEOUT" : "PROCESSING_FAILED";
      await this.store.failProcessing(jobId, claimed.document.id, safeCode, rejected, this.now());
      throw error;
    }
  }
}
