import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TrackDownloadCommand } from './track-download.command';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { Result } from '../../../../../shared/domain/result';

@CommandHandler(TrackDownloadCommand)
@Injectable()
export class TrackDownloadHandler implements ICommandHandler<TrackDownloadCommand, Result<void>> {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(command: TrackDownloadCommand): Promise<Result<void>> {
    const { documentId, userId } = command;

    // Find document
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Check access permissions
    // User can download if:
    // 1. Document is public (isPublic = true), OR
    // 2. User is the owner (lawyerId = userId)
    if (!document.isPublic && document.lawyerId !== userId) {
      throw new ForbiddenException('You do not have permission to download this document');
    }

    // Increment download count
    const incrementResult = document.incrementDownloadCount();
    if (incrementResult.isFailure) {
      return Result.fail(incrementResult.error);
    }

    // Save updated document
    await this.documentRepository.save(document);

    return Result.ok();
  }
}
