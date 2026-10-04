import { and, eq } from "drizzle-orm";
import type { Database } from "@/lib/db/client";
import { auditEvents, documentPages, documents, processingJobs } from "@/lib/db/schema";
import type { DerivedPageInput, DocumentStore, QuarantinedDocumentInput } from "@/lib/documents/document-store";

export class PostgresDocumentStore implements DocumentStore {
  constructor(private readonly db: Database) {}

  async createQuarantinedAndQueue(input: QuarantinedDocumentInput) {
    return this.db.transaction(async (tx) => {
      const [existingJob] = await tx.select().from(processingJobs).where(eq(processingJobs.idempotencyKey, input.idempotencyKey)).limit(1);
      if (existingJob) {
        const [document] = await tx.select().from(documents).where(eq(documents.id, existingJob.documentId)).limit(1);
        return { document, job: existingJob, created: false };
      }
      const [document] = await tx.insert(documents).values({
        title: input.title, subjectId: input.subjectId, type: input.type, status: "queued",
        originalKey: input.originalKey, originalSha256: input.originalSha256,
        originalBytes: input.originalBytes, originalMime: input.originalMime, createdBy: input.createdBy,
      }).returning();
      const [job] = await tx.insert(processingJobs).values({ documentId: document.id, idempotencyKey: input.idempotencyKey, status: "queued" }).returning();
      await tx.insert(auditEvents).values({ actorId: input.createdBy, action: "document.upload", objectType: "document", objectId: document.id, result: "success", requestId: input.requestId, after: { status: "queued", original_sha256: input.originalSha256, original_bytes: input.originalBytes } });
      return { document, job, created: true };
    });
  }

  async claimJob(jobId: string, now: Date) {
    return this.db.transaction(async (tx) => {
      const [job] = await tx.select().from(processingJobs).where(eq(processingJobs.id, jobId)).for("update").limit(1);
      if (!job || job.status === "completed" || job.status === "processing") return null;
      const [document] = await tx.select().from(documents).where(eq(documents.id, job.documentId)).for("update").limit(1);
      if (!document || document.status === "ready" || document.status === "archived") return null;
      const [claimed] = await tx.update(processingJobs).set({ status: "processing", attempt: job.attempt + 1, startedAt: now, finishedAt: null, safeFailureCode: null }).where(eq(processingJobs.id, job.id)).returning();
      const [processing] = await tx.update(documents).set({ status: "processing", processingProgress: 1, safeFailureCode: null, updatedAt: now }).where(eq(documents.id, document.id)).returning();
      return { document: processing, job: claimed };
    });
  }

  async publishProcessed(jobId: string, documentId: string, pages: DerivedPageInput[], pageCount: number, now: Date) {
    const expected = pageCount * 3;
    const unique = new Set(pages.map((page) => `${page.pageNumber}:${page.variant}`));
    const pageNumbers = new Set(pages.map((page) => page.pageNumber));
    if (pages.length !== expected || unique.size !== expected || pageNumbers.size !== pageCount || Math.min(...pageNumbers) !== 1 || Math.max(...pageNumbers) !== pageCount) throw new Error("derived_pages_incomplete");

    await this.db.transaction(async (tx) => {
      const [job] = await tx.select().from(processingJobs).where(and(eq(processingJobs.id, jobId), eq(processingJobs.documentId, documentId))).for("update").limit(1);
      if (!job || job.status === "completed") return;
      if (job.status !== "processing") throw new Error("processing_job_not_claimed");
      await tx.delete(documentPages).where(eq(documentPages.documentId, documentId));
      await tx.insert(documentPages).values(pages.map((page) => ({ ...page, documentId })));
      await tx.update(documents).set({ status: "ready", pageCount, processingProgress: 100, safeFailureCode: null, publishedAt: now, updatedAt: now }).where(eq(documents.id, documentId));
      await tx.update(processingJobs).set({ status: "completed", finishedAt: now, safeFailureCode: null }).where(eq(processingJobs.id, jobId));
    });
  }

  async failProcessing(jobId: string, documentId: string, safeFailureCode: string, rejected: boolean, now: Date) {
    await this.db.transaction(async (tx) => {
      await tx.update(processingJobs).set({ status: "failed", safeFailureCode, finishedAt: now }).where(eq(processingJobs.id, jobId));
      await tx.update(documents).set({ status: rejected ? "rejected" : "failed", safeFailureCode, processingProgress: 0, publishedAt: null, updatedAt: now }).where(eq(documents.id, documentId));
    });
  }
}
