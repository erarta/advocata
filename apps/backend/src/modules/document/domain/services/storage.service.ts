import { Result } from '../../../../shared/domain/result';

export interface UploadFileResult {
  url: string;
  key: string;
}

export interface IStorageService {
  uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<Result<UploadFileResult>>;
  downloadFile(key: string): Promise<Result<Buffer>>;
  deleteFile(key: string): Promise<Result<void>>;
  getSignedUrl(key: string, expiresIn?: number): Promise<Result<string>>;
}
