import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { MessageOrmEntity } from './infrastructure/persistence/message.orm-entity';
import { MessageAttachmentOrmEntity } from './infrastructure/persistence/message-attachment.orm-entity';
import { MessageRepository } from './infrastructure/persistence/message.repository';
import { MESSAGE_REPOSITORY } from './domain/repositories/message.repository.interface';

// Application - Commands
import { SendMessageHandler } from './application/commands/send-message/send-message.handler';
import { MarkMessagesAsReadHandler } from './application/commands/mark-messages-as-read/mark-messages-as-read.handler';
import { DeleteMessageHandler } from './application/commands/delete-message/delete-message.handler';

// Application - Queries
import { GetMessagesHandler } from './application/queries/get-messages/get-messages.handler';
import { GetUnreadCountHandler } from './application/queries/get-unread-count/get-unread-count.handler';

// Presentation
import { MessageController } from './presentation/controllers/message.controller';

const commandHandlers = [
  SendMessageHandler,
  MarkMessagesAsReadHandler,
  DeleteMessageHandler,
];

const queryHandlers = [
  GetMessagesHandler,
  GetUnreadCountHandler,
];

const repositories = [
  {
    provide: MESSAGE_REPOSITORY,
    useClass: MessageRepository,
  },
];

/**
 * Message Module
 *
 * Bounded context for Chat/Messaging functionality.
 * Handles sending, retrieving, and managing messages in consultations.
 *
 * Architecture:
 * - Domain Layer: Message entity, value objects, events, repository interface
 * - Application Layer: Commands (SendMessage, MarkAsRead, Delete), Queries (GetMessages, GetUnreadCount)
 * - Infrastructure Layer: TypeORM entities, repository implementation
 * - Presentation Layer: REST API controller, DTOs
 */
@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([MessageOrmEntity, MessageAttachmentOrmEntity]),
  ],
  controllers: [MessageController],
  providers: [...commandHandlers, ...queryHandlers, ...repositories],
  exports: [...repositories],
})
export class MessageModule {}
