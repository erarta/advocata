import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DeleteDocumentCommand } from './delete-document.command';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { Result } from '../../../../../shared/domain/result';
import { IStorageService } from '../../../domain/services/storage.service';

@CommandHandler(DeleteDocumentCommand)
@Injectable()
export class DeleteDocumentHandler implements ICommandHandler<DeleteDocumentCommand, Result<void>> {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly storageService: IStorageService,
  ) {}

  async execute(command: DeleteDocumentCommand): Promise<Result<void>> {
    try {
      // 1. Load document
      const document = await this.documentRepository.findById(command.documentId);
      if (!document) {
        return Result.fail('Document not found');
      }

      // 2. Authorization check
      if (document.lawyerId !== command.requestingUserId) {
        return Result.fail('Unauthorized: You can only delete your own documents');
      }

      // 3. Delete chunks
      await this.documentRepository.deleteChunksByDocumentId(document.id);

      // 4. Delete document record
      await this.documentRepository.delete(document.id);

      // 5. Delete file from storage (async, don't wait)
      const fileKey = this.extractFileKeyFromUrl(document.fileUrl);
      this.storageService.deleteFile(fileKey).catch((error) => {
        // Log error but don't fail the command
        console.error(`Failed to delete file from storage: ${error.message}`);
      });

      return Result.ok();
    } catch (error) {
      return Result.fail(`Unexpected error: ${error.message}`);
    }
  }

  private extractFileKeyFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1) {
        return pathParts.slice(publicIndex + 1).join('/');
      }
      const objectIndex = pathParts.indexOf('object');
      if (objectIndex !== -1) {
        return pathParts.slice(objectIndex + 1).join('/');
      }
      throw new Error('Could not extract file key from URL');
    } catch (error) {
      throw new Error(`Invalid file URL: ${url}`);
    }
  }
}
