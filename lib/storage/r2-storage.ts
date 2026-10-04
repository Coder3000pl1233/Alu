import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { PrivateObjectStorage } from "@/lib/storage/object-storage";

export type R2StorageOptions = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

export class R2PrivateStorage implements PrivateObjectStorage {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(options: R2StorageOptions) {
    if (!options.accountId || !options.bucket || !options.accessKeyId || !options.secretAccessKey) throw new Error("Configuración R2 incompleta");
    this.bucket = options.bucket;
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${options.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: options.accessKeyId, secretAccessKey: options.secretAccessKey },
    });
  }

  async putPrivate(key: string, body: Uint8Array, contentType: string, metadata?: Record<string, string>) {
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: body, ContentType: contentType, Metadata: metadata }));
  }

  async getPrivate(key: string) {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!response.Body) throw new Error("r2_object_body_missing");
    return {
      body: await response.Body.transformToByteArray(),
      contentType: response.ContentType,
      metadata: response.Metadata,
    };
  }

  async deletePrivate(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
