import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { ProcessDocumentCommand } from '../../application/commands/process-document';

@Processor('document-processing')
export class DocumentProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'process-document':
        return await this.processDocument(job);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async processDocument(job: Job<{ documentId: string }>): Promise<void> {
    const { documentId } = job.data;

    this.logger.log(`Processing document: ${documentId}`);

    try {
      const command = new ProcessDocumentCommand(documentId);
      const result = await this.commandBus.execute(command);

      if (result.isFailure) {
        this.logger.error(`Document processing failed: ${result.error}`);
        throw new Error(result.error);
      }

      this.logger.log(`Document ${documentId} processed successfully`);
    } catch (error) {
      this.logger.error(
        `Error processing document ${documentId}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw to mark job as failed
    }
  }
}
