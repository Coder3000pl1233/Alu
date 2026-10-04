import { createHash, randomUUID } from "node:crypto";
import type { DocumentStore } from "@/lib/documents/document-store";
import type { PrivateObjectStorage } from "@/lib/storage/object-storage";
import type { DocumentProcessingQueue } from "@/lib/documents/processing-queue";

export type UploadPolicy = { maximumBytes: number };
export const DEFAULT_UPLOAD_POLICY: UploadPolicy = { maximumBytes: 25 * 1024 * 1024 };

export class DocumentUploadError extends Error {
  constructor(readonly code: "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE" | "VALIDATION_FAILED") {
    super(code);
    this.name = "DocumentUploadError";
  }
}

export type UploadDocumentInput = {
  title: string;
  subjectId: string;
  type: "note" | "guide" | "book" | "mock_exam";
  fileName: string;
  bytes: Uint8Array;
  createdBy: string;
  idempotencyKey: string;
  requestId: string;
};

export class DocumentUploadService {
  constructor(private readonly storage: PrivateObjectStorage, private readonly store: DocumentStore, private readonly queue: Pick<DocumentProcessingQueue, "enqueue">, private readonly policy = DEFAULT_UPLOAD_POLICY) {}

  async upload(input: UploadDocumentInput) {
    if (!input.title.trim() || !["anatomia", "biologia", "histologia"].includes(input.subjectId) || !["note", "guide", "book", "mock_exam"].includes(input.type) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.idempotencyKey)) throw new DocumentUploadError("VALIDATION_FAILED");
    if (input.bytes.byteLength === 0) throw new DocumentUploadError("UNSUPPORTED_MEDIA_TYPE");
    if (input.bytes.byteLength > this.policy.maximumBytes) throw new DocumentUploadError("PAYLOAD_TOO_LARGE");
    const normalizedBytes = Buffer.from(input.bytes);
    if (normalizedBytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new DocumentUploadError("UNSUPPORTED_MEDIA_TYPE");

    const sha256 = createHash("sha256").update(normalizedBytes).digest("hex");
    const originalKey = `quarantine/${randomUUID()}/original.pdf`;
    await this.storage.putPrivate(originalKey, normalizedBytes, "application/pdf", { sha256, original_name_hash: createHash("sha256").update(input.fileName).digest("hex") });
    let result;
    try {
      result = await this.store.createQuarantinedAndQueue({
        title: input.title.trim(), subjectId: input.subjectId.trim(), type: input.type,
        originalKey, originalSha256: sha256, originalBytes: normalizedBytes.byteLength,
        originalMime: "application/pdf", createdBy: input.createdBy,
        idempotencyKey: input.idempotencyKey, requestId: input.requestId,
      });
    } catch (error) {
      await this.storage.deletePrivate(originalKey).catch(() => undefined);
      throw error;
    }
    if (!result.created) await this.storage.deletePrivate(originalKey);
    await this.queue.enqueue(result.job.id);
    return result;
  }
}
