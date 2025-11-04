import * as fs from 'fs';
import * as path from 'path';
import { StorageDriver, StoredObject } from './storage.interface';

export class LocalStorage implements StorageDriver {
  constructor(
    private baseDir = process.env.LOCAL_UPLOAD_DIR || './uploads',
    private baseUrl = process.env.BASE_URL || 'http://localhost:3000',
  ) {
    if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true });
  }

  async save(buffer: Buffer, key: string, _ct?: string): Promise<StoredObject> {
    const abs = path.join(this.baseDir, key);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    await fs.promises.writeFile(abs, buffer);
    return { publicUrl: `${this.baseUrl}/static/${key}`, absolutePath: abs };
  }
}
