import { PgBoss } from "pg-boss";

export const DOCUMENT_QUEUE = "document-processing";
export type DocumentJobPayload = { jobId: string };

export class DocumentProcessingQueue {
  private readonly boss: PgBoss;

  constructor(databaseUrl: string) {
    this.boss = new PgBoss({ connectionString: databaseUrl, application_name: "aula-document-queue" });
  }

  async start() {
    await this.boss.start();
    await this.boss.createQueue(DOCUMENT_QUEUE, { policy: "key_strict_fifo", retryLimit: 3, retryDelay: 30, retryBackoff: true, expireInSeconds: 300 });
  }

  async enqueue(jobId: string) {
    return this.boss.send(DOCUMENT_QUEUE, { jobId } satisfies DocumentJobPayload, { singletonKey: jobId });
  }

  async work(handler: (payload: DocumentJobPayload) => Promise<void>) {
    return this.boss.work<DocumentJobPayload>(DOCUMENT_QUEUE, { batchSize: 1 }, async (jobs) => {
      for (const job of jobs) await handler(job.data);
    });
  }

  stop() {
    return this.boss.stop({ graceful: true, timeout: 30_000 });
  }
}
