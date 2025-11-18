import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ProcessDocumentCommand } from './process-document.command';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { DocumentChunk } from '../../../domain/entities/document-chunk.entity';
import { Result } from '../../../../../shared/domain/result';
import { IDocumentProcessor } from '../../../domain/services/document-processor.service';
import { IStorageService } from '../../../domain/services/storage.service';

@CommandHandler(ProcessDocumentCommand)
@Injectable()
export class ProcessDocumentHandler implements ICommandHandler<ProcessDocumentCommand, Result<void>> {
  private readonly logger = new Logger(ProcessDocumentHandler.name);

  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentProcessor: IDocumentProcessor,
    private readonly storageService: IStorageService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: ProcessDocumentCommand): Promise<Result<void>> {
    try {
      // 1. Load document
      const document = await this.documentRepository.findById(command.documentId);
      if (!document) {
        return Result.fail('Document not found');
      }

      this.logger.log(`Processing document ${document.id}: ${document.title}`);

      // 2. Mark as processing
      const processingResult = document.markAsProcessing();
      if (processingResult.isFailure) {
        return Result.fail(processingResult.error);
      }
      await this.documentRepository.save(document);

      try {
        // 3. Download file from storage
        const fileKey = this.extractFileKeyFromUrl(document.fileUrl);
        const downloadResult = await this.storageService.downloadFile(fileKey);

        if (downloadResult.isFailure) {
          throw new Error(`Failed to download file: ${downloadResult.error}`);
        }

        const fileBuffer = downloadResult.value;

        // 4. Extract content
        this.logger.log(`Extracting content from ${document.fileName}`);
        const extractedContent = await this.documentProcessor.extractContent(
          fileBuffer,
          document.type,
        );

        // 5. Update document metadata
        document.updateMetadata({
          pageCount: extractedContent.pageCount,
          extractedAt: new Date().toISOString(),
          ...extractedContent.metadata,
        });

        // 6. Chunk text
        this.logger.log(`Chunking text (${extractedContent.text.length} characters)`);
        const chunks = await this.documentProcessor.chunkText(extractedContent.text);

        this.logger.log(`Created ${chunks.length} chunks`);

        // 7. Generate embeddings
        this.logger.log(`Generating embeddings for ${chunks.length} chunks`);
        const chunkContents = chunks.map((chunk) => chunk.content);
        const embeddings = await this.documentProcessor.generateEmbeddings(chunkContents);

        // 8. Create DocumentChunk entities
        const documentChunks: DocumentChunk[] = [];
        for (let i = 0; i < chunks.length; i++) {
          const chunkResult = DocumentChunk.create(
            uuidv4(),
            document.id,
            chunks[i].content,
            embeddings[i],
            i,
            chunks[i].metadata?.pageNumber,
            chunks[i].metadata,
          );

          if (chunkResult.isFailure) {
            this.logger.warn(`Failed to create chunk ${i}: ${chunkResult.error}`);
            continue;
          }

          documentChunks.push(chunkResult.value);
        }

        // 9. Delete old chunks (if reprocessing)
        await this.documentRepository.deleteChunksByDocumentId(document.id);

        // 10. Save chunks
        this.logger.log(`Saving ${documentChunks.length} chunks to database`);
        await this.documentRepository.saveChunks(documentChunks);

        // 11. Mark as completed
        const completedResult = document.markAsCompleted(documentChunks.length);
        if (completedResult.isFailure) {
          throw new Error(completedResult.error);
        }

        await this.documentRepository.save(document);

        // 12. Publish domain events
        const events = document.domainEvents;
        events.forEach((event) => this.eventBus.publish(event));
        document.clearDomainEvents();

        this.logger.log(`Successfully processed document ${document.id}`);
        return Result.ok();
      } catch (processingError) {
        // Mark as failed
        this.logger.error(`Processing failed: ${processingError.message}`, processingError.stack);

        document.markAsFailed(processingError.message);
        await this.documentRepository.save(document);

        return Result.fail(`Processing failed: ${processingError.message}`);
      }
    } catch (error) {
      this.logger.error(`Unexpected error: ${error.message}`, error.stack);
      return Result.fail(`Unexpected error: ${error.message}`);
    }
  }

  private extractFileKeyFromUrl(url: string): string {
    // Extract file key from Supabase URL
    // Example: https://xxx.supabase.co/storage/v1/object/public/documents/lawyer-id/doc-id/file.pdf
    // Returns: documents/lawyer-id/doc-id/file.pdf
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1) {
        return pathParts.slice(publicIndex + 1).join('/');
      }
      // Fallback: return everything after /object/
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
