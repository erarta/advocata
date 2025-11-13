import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { IStorageService, UploadFileResult } from '../../domain/services/storage.service';
import { Result } from '../../../../shared/domain/result';

@Injectable()
export class SupabaseStorageService implements IStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly bucketName: string = 'documents';

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<Result<UploadFileResult>> {
    try {
      this.logger.log(`Uploading file to ${this.bucketName}/${key}`);

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(key, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) {
        this.logger.error(`Upload failed: ${error.message}`);
        return Result.fail(`Failed to upload file: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage.from(this.bucketName).getPublicUrl(key);

      this.logger.log(`File uploaded successfully: ${urlData.publicUrl}`);

      return Result.ok({
        url: urlData.publicUrl,
        key: data.path,
      });
    } catch (error) {
      this.logger.error(`Unexpected error during upload: ${error.message}`, error.stack);
      return Result.fail(`Unexpected error: ${error.message}`);
    }
  }

  async downloadFile(key: string): Promise<Result<Buffer>> {
    try {
      this.logger.log(`Downloading file from ${this.bucketName}/${key}`);

      const { data, error } = await this.supabase.storage.from(this.bucketName).download(key);

      if (error) {
        this.logger.error(`Download failed: ${error.message}`);
        return Result.fail(`Failed to download file: ${error.message}`);
      }

      // Convert Blob to Buffer
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      this.logger.log(`File downloaded successfully (${buffer.length} bytes)`);

      return Result.ok(buffer);
    } catch (error) {
      this.logger.error(`Unexpected error during download: ${error.message}`, error.stack);
      return Result.fail(`Unexpected error: ${error.message}`);
    }
  }

  async deleteFile(key: string): Promise<Result<void>> {
    try {
      this.logger.log(`Deleting file from ${this.bucketName}/${key}`);

      const { error } = await this.supabase.storage.from(this.bucketName).remove([key]);

      if (error) {
        this.logger.error(`Delete failed: ${error.message}`);
        return Result.fail(`Failed to delete file: ${error.message}`);
      }

      this.logger.log(`File deleted successfully`);

      return Result.ok();
    } catch (error) {
      this.logger.error(`Unexpected error during delete: ${error.message}`, error.stack);
      return Result.fail(`Unexpected error: ${error.message}`);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<Result<string>> {
    try {
      this.logger.log(`Generating signed URL for ${this.bucketName}/${key}`);

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(key, expiresIn);

      if (error) {
        this.logger.error(`Signed URL generation failed: ${error.message}`);
        return Result.fail(`Failed to generate signed URL: ${error.message}`);
      }

      return Result.ok(data.signedUrl);
    } catch (error) {
      this.logger.error(`Unexpected error during signed URL generation: ${error.message}`, error.stack);
      return Result.fail(`Unexpected error: ${error.message}`);
    }
  }
}
