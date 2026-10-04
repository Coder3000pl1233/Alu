export type StoredObject = {
  body: Uint8Array;
  contentType?: string;
  metadata?: Record<string, string>;
};

export interface PrivateObjectStorage {
  putPrivate(key: string, body: Uint8Array, contentType: string, metadata?: Record<string, string>): Promise<void>;
  getPrivate(key: string): Promise<StoredObject>;
  deletePrivate(key: string): Promise<void>;
}
