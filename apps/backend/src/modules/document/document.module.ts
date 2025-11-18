import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';

// Entities
import { DocumentOrmEntity } from './infrastructure/persistence/entities/document.orm-entity';
import { DocumentChunkOrmEntity } from './infrastructure/persistence/entities/document-chunk.orm-entity';

// Repositories
import { DocumentRepository } from './domain/repositories/document.repository';
import { DocumentRepositoryImpl } from './infrastructure/persistence/repositories/document.repository.impl';

// Services
import { IDocumentProcessor } from './domain/services/document-processor.service';
import { DocumentProcessorService } from './infrastructure/services/document-processor.service';
import { IStorageService } from './domain/services/storage.service';
import { SupabaseStorageService } from './infrastructure/services/supabase-storage.service';
import { ILLMService } from './domain/services/llm.service';
import { OpenAILLMService } from './infrastructure/services/openai-llm.service';

// Command Handlers
import { UploadDocumentHandler } from './application/commands/upload-document';
import { ProcessDocumentHandler } from './application/commands/process-document';
import { DeleteDocumentHandler } from './application/commands/delete-document';

// Query Handlers
import { SearchDocumentsHandler } from './application/queries/search-documents';
import { GetDocumentHandler } from './application/queries/get-document';
import { SearchSimilarDocumentsHandler } from './application/queries/search-similar-documents';
import { AskQuestionHandler } from './application/queries/ask-question';

// Controllers
import { DocumentController } from './presentation/controllers/document.controller';
import { ChatController } from './presentation/controllers/chat.controller';

// Processors
import { DocumentProcessor } from './infrastructure/jobs/document.processor';

const commandHandlers = [UploadDocumentHandler, ProcessDocumentHandler, DeleteDocumentHandler];

const queryHandlers = [
  SearchDocumentsHandler,
  GetDocumentHandler,
  SearchSimilarDocumentsHandler,
  AskQuestionHandler,
];

const repositories = [
  {
    provide: DocumentRepository,
    useClass: DocumentRepositoryImpl,
  },
];

const services = [
  {
    provide: IDocumentProcessor,
    useClass: DocumentProcessorService,
  },
  {
    provide: IStorageService,
    useClass: SupabaseStorageService,
  },
  {
    provide: ILLMService,
    useClass: OpenAILLMService,
  },
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    TypeOrmModule.forFeature([DocumentOrmEntity, DocumentChunkOrmEntity]),
    BullModule.registerQueue({
      name: 'document-processing',
    }),
  ],
  controllers: [DocumentController, ChatController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    ...services,
    DocumentProcessor,
  ],
  exports: [DocumentRepository, IDocumentProcessor, IStorageService, ILLMService],
})
export class DocumentModule {}
