export interface StorageUploadResult {
  url: string;
  path: string;
}

export async function uploadFile(
  _buffer: Buffer,
  _options: { path: string; mimeType: string }
): Promise<StorageUploadResult> {
  throw new Error("Storage provider not configured. Set up a storage backend.");
}
