import sharp from "sharp";
import { describe, expect, it } from "vitest";
import type { Document, ProcessingJob } from "@/lib/db/schema";
import type { DerivedPageInput, DocumentStore, QuarantinedDocumentInput } from "@/lib/documents/document-store";
import { DocumentUploadError, DocumentUploadService } from "@/lib/documents/upload-service";
import type { PrivateObjectStorage, StoredObject } from "@/lib/storage/object-storage";
import { DocumentProcessor } from "@/worker/document-processor";
import type { PageRasterizer } from "@/worker/rasterizer";
import { createHash } from "node:crypto";

const NOW = new Date("2026-08-02T12:00:00Z");
const REQUEST_ID = "9b191d15-c7f7-4b2a-97a0-190681a74fa8";
const USER_ID = "fc4fe825-bd42-4baa-9a9f-1fb8d7d98277";
const JOB_ID = "c80caf6d-c198-4352-b74e-249fd0ee96c7";
const DOCUMENT_ID = "fd4a2f4c-cb5e-4634-9e43-e75b0627b12f";

class MemoryStorage implements PrivateObjectStorage {
  objects = new Map<string, StoredObject>();
  deleted: string[] = [];
  async putPrivate(key: string, body: Uint8Array, contentType: string, metadata?: Record<string, string>) { this.objects.set(key, { body, contentType, metadata }); }
  async getPrivate(key: string) { const value = this.objects.get(key); if (!value) throw new Error("missing"); return value; }
  async deletePrivate(key: string) { this.objects.delete(key); this.deleted.push(key); }
}

const makeDocument = (original: Uint8Array): Document => ({
  id: DOCUMENT_ID, title: "Anatomía", subjectId: "anatomia", type: "note", status: "queued",
  originalKey: "quarantine/original.pdf", originalSha256: createHash("sha256").update(original).digest("hex"),
  originalBytes: original.byteLength, originalMime: "application/pdf", pageCount: null, processingProgress: 0,
  safeFailureCode: null, publishedAt: null, createdBy: USER_ID, createdAt: NOW, updatedAt: NOW,
});
const makeJob = (): ProcessingJob => ({ id: JOB_ID, documentId: DOCUMENT_ID, idempotencyKey: REQUEST_ID, status: "queued", attempt: 0, safeFailureCode: null, startedAt: null, finishedAt: null, createdAt: NOW });

class MemoryDocumentStore implements DocumentStore {
  document?: Document;
  job?: ProcessingJob;
  published?: { pages: DerivedPageInput[]; pageCount: number };
  failed?: { code: string; rejected: boolean };
  duplicate = false;
  async createQuarantinedAndQueue(input: QuarantinedDocumentInput) {
    const document = makeDocument(new Uint8Array());
    document.originalKey = input.originalKey; document.originalSha256 = input.originalSha256; document.originalBytes = input.originalBytes;
    this.document = document; this.job = makeJob();
    return { document, job: this.job, created: !this.duplicate };
  }
  async claimJob() {
    if (!this.document || !this.job) return null;
    this.document.status = "processing"; this.job.status = "processing";
    return { document: this.document, job: this.job };
  }
  async publishProcessed(_jobId: string, _documentId: string, pages: DerivedPageInput[], pageCount: number) { this.published = { pages, pageCount }; }
  async failProcessing(_jobId: string, _documentId: string, safeFailureCode: string, rejected: boolean) { this.failed = { code: safeFailureCode, rejected }; }
}

describe("document quarantine", () => {
  const validPdf = new TextEncoder().encode("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF");
  const input = { title: "Bloque 1", subjectId: "anatomia", type: "note" as const, fileName: "bloque.pdf", bytes: validPdf, createdBy: USER_ID, idempotencyKey: REQUEST_ID, requestId: REQUEST_ID };
  const queue = () => ({ enqueued: [] as string[], async enqueue(jobId: string) { this.enqueued.push(jobId); return jobId; } });

  it("acepta por magic bytes, calcula integridad y usa una clave privada impredecible", async () => {
    const storage = new MemoryStorage(); const store = new MemoryDocumentStore();
    const jobs = queue();
    const result = await new DocumentUploadService(storage, store, jobs).upload(input);
    expect(result.created).toBe(true);
    expect(result.document.originalKey).toMatch(/^quarantine\/[0-9a-f-]+\/original\.pdf$/);
    expect(storage.objects.get(result.document.originalKey)?.metadata?.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(jobs.enqueued).toEqual([JOB_ID]);
  });

  it("rechaza extensión PDF falsa y exceso de tamaño", async () => {
    const service = new DocumentUploadService(new MemoryStorage(), new MemoryDocumentStore(), queue(), { maximumBytes: 20 });
    await expect(service.upload({ ...input, bytes: new TextEncoder().encode("esto no es pdf") })).rejects.toBeInstanceOf(DocumentUploadError);
    await expect(service.upload(input)).rejects.toMatchObject({ code: "PAYLOAD_TOO_LARGE" });
  });

  it("elimina el objeto duplicado cuando se repite la idempotency key", async () => {
    const storage = new MemoryStorage(); const store = new MemoryDocumentStore(); store.duplicate = true;
    const jobs = queue();
    const result = await new DocumentUploadService(storage, store, jobs).upload(input);
    expect(result.created).toBe(false);
    expect(storage.objects.size).toBe(0);
    expect(storage.deleted).toHaveLength(1);
    expect(jobs.enqueued).toEqual([JOB_ID]);
  });
});

describe("document processing", () => {
  it("genera master, normal y high con hashes antes de publicar", async () => {
    const pdf = new TextEncoder().encode("%PDF-demo");
    const png = await sharp({ create: { width: 32, height: 48, channels: 3, background: "white" } }).png().toBuffer();
    const storage = new MemoryStorage(); const store = new MemoryDocumentStore();
    store.document = makeDocument(pdf); store.job = makeJob();
    await storage.putPrivate(store.document.originalKey, pdf, "application/pdf");
    const rasterizer: PageRasterizer = { rasterize: async () => [{ pageNumber: 1, png, width: 32, height: 48 }, { pageNumber: 2, png, width: 32, height: 48 }] };
    await new DocumentProcessor(store, storage, rasterizer, () => NOW).process(JOB_ID);
    expect(store.published?.pageCount).toBe(2);
    expect(store.published?.pages).toHaveLength(6);
    expect(new Set(store.published?.pages.map((page) => page.variant))).toEqual(new Set(["master", "normal", "high"]));
    expect(store.published?.pages.every((page) => /^[a-f0-9]{64}$/.test(page.sha256))).toBe(true);
  });

  it("no publica parciales y limpia derivados ante un fallo", async () => {
    const pdf = new TextEncoder().encode("%PDF-demo");
    const storage = new MemoryStorage(); const store = new MemoryDocumentStore();
    store.document = makeDocument(pdf); store.job = makeJob();
    await storage.putPrivate(store.document.originalKey, pdf, "application/pdf");
    const rasterizer: PageRasterizer = { rasterize: async () => { throw new Error("pdf_rasterizer_failed:1"); } };
    await expect(new DocumentProcessor(store, storage, rasterizer, () => NOW).process(JOB_ID)).rejects.toThrow();
    expect(store.published).toBeUndefined();
    expect(store.failed).toEqual({ code: "DOCUMENT_REJECTED", rejected: true });
  });
});
