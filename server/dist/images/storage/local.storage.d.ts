import { StorageDriver, StoredObject } from './storage.interface';
export declare class LocalStorage implements StorageDriver {
    private baseDir;
    private baseUrl;
    constructor(baseDir?: string, baseUrl?: string);
    save(buffer: Buffer, key: string, _ct?: string): Promise<StoredObject>;
}
