import type { Document, DocumentPage, ProcessingJob } from "@/lib/db/schema";

export type QuarantinedDocumentInput = {
  title: string;
  subjectId: string;
  type: "note" | "guide" | "book" | "mock_exam";
  originalKey: string;
  originalSha256: string;
  originalBytes: number;
  originalMime: string;
  createdBy: string;
  idempotencyKey: string;
  requestId: string;
};

export type DerivedPageInput = Pick<DocumentPage, "pageNumber" | "variant" | "storageKey" | "sha256" | "byteSize" | "width" | "height">;

export interface DocumentStore {
  createQuarantinedAndQueue(input: QuarantinedDocumentInput): Promise<{ document: Document; job: ProcessingJob; created: boolean }>;
  claimJob(jobId: string, now: Date): Promise<{ document: Document; job: ProcessingJob } | null>;
  publishProcessed(jobId: string, documentId: string, pages: DerivedPageInput[], pageCount: number, now: Date): Promise<void>;
  failProcessing(jobId: string, documentId: string, safeFailureCode: string, rejected: boolean, now: Date): Promise<void>;
}
