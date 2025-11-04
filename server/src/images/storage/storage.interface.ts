export interface StoredObject { publicUrl: string; absolutePath?: string; }

export interface StorageDriver {
  save(buffer: Buffer, key: string, contentType?: string): Promise<StoredObject>;
}
