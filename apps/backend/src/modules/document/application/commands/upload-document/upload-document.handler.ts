import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UploadDocumentCommand } from './upload-document.command';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { Document } from '../../../domain/entities/document.entity';
import { Result } from '../../../../../shared/domain/result';
import { IStorageService } from '../../../domain/services/storage.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

export interface UploadDocumentResult {
  documentId: string;
  fileUrl: string;
}

@CommandHandler(UploadDocumentCommand)
@Injectable()
export class UploadDocumentHandler
  implements ICommandHandler<UploadDocumentCommand, Result<UploadDocumentResult>>
{
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly storageService: IStorageService,
    private readonly eventBus: EventBus,
    @InjectQueue('document-processing') private readonly documentQueue: Queue,
  ) {}

  async execute(command: UploadDocumentCommand): Promise<Result<UploadDocumentResult>> {
    try {
      // 1. Validate file size
      const fileSize = command.fileBuffer.length;
      if (fileSize === 0) {
        return Result.fail('File is empty');
      }

      if (fileSize > 100 * 1024 * 1024) {
        return Result.fail('File size exceeds maximum limit (100MB)');
      }

      // 2. Upload file to storage
      const documentId = uuidv4();
      const fileKey = `documents/${command.lawyerId}/${documentId}/${command.fileName}`;

      const uploadResult = await this.storageService.uploadFile(
        fileKey,
        command.fileBuffer,
        command.mimeType,
      );

      if (uploadResult.isFailure) {
        return Result.fail(`Failed to upload file: ${uploadResult.error}`);
      }

      const fileUrl = uploadResult.value.url;

      // 3. Create Document entity
      const documentResult = Document.create(
        documentId,
        command.lawyerId,
        command.title,
        command.fileName,
        fileUrl,
        fileSize,
        command.mimeType,
        command.type,
        command.category,
        command.description,
        command.isPublic,
        command.tags,
        command.metadata,
      );

      if (documentResult.isFailure) {
        // Rollback: delete uploaded file
        await this.storageService.deleteFile(fileKey);
        return Result.fail(documentResult.error);
      }

      const document = documentResult.value;

      // 4. Save document to database
      await this.documentRepository.save(document);

      // 5. Publish domain events
      const events = document.domainEvents;
      events.forEach((event) => this.eventBus.publish(event));
      document.clearDomainEvents();

      // 6. Queue document for processing
      await this.documentQueue.add('process-document', {
        documentId: document.id,
      });

      return Result.ok({
        documentId: document.id,
        fileUrl: document.fileUrl,
      });
    } catch (error) {
      return Result.fail(`Unexpected error: ${error.message}`);
    }
  }
}
