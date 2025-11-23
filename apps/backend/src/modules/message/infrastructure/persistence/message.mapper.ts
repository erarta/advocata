import { Message } from '../../domain/entities/message.entity';
import { MessageType } from '../../domain/value-objects/message-type.vo';
import { MessageStatus } from '../../domain/value-objects/message-status.vo';
import { MessageAttachment } from '../../domain/value-objects/message-attachment.vo';
import { MessageOrmEntity } from './message.orm-entity';
import { MessageAttachmentOrmEntity } from './message-attachment.orm-entity';

/**
 * Message Mapper
 *
 * Maps between Message domain entity and MessageOrmEntity (persistence).
 * Follows the Repository pattern for clean architecture.
 */
export class MessageMapper {
  /**
   * Map ORM entity to Domain entity
   */
  public static toDomain(ormEntity: MessageOrmEntity): Message {
    // Map attachments
    const attachments: MessageAttachment[] = (ormEntity.attachments || [])
      .map((ormAttachment) => {
        const attachmentResult = MessageAttachment.create({
          id: ormAttachment.id,
          fileName: ormAttachment.fileName,
          fileUrl: ormAttachment.fileUrl,
          fileSize: Number(ormAttachment.fileSize),
          mimeType: ormAttachment.mimeType,
          createdAt: ormAttachment.createdAt,
        });

        return attachmentResult.isSuccess ? attachmentResult.getValue() : null;
      })
      .filter((attachment) => attachment !== null) as MessageAttachment[];

    // Create message
    const messageResult = Message.create(
      ormEntity.id,
      ormEntity.consultationId,
      ormEntity.senderId,
      ormEntity.senderName,
      ormEntity.content,
      ormEntity.type as MessageType,
      ormEntity.senderAvatar,
    );

    if (messageResult.isFailure) {
      throw new Error(
        `Failed to map ORM entity to domain: ${messageResult.error}`,
      );
    }

    const message = messageResult.getValue();

    // Set additional properties that aren't set in create()
    (message as any).props.status = ormEntity.status as MessageStatus;
    (message as any).props.attachments = attachments;
    (message as any).props.createdAt = ormEntity.createdAt;
    (message as any).props.deliveredAt = ormEntity.deliveredAt;
    (message as any).props.readAt = ormEntity.readAt;
    (message as any).props.deletedAt = ormEntity.deletedAt;

    return message;
  }

  /**
   * Map Domain entity to ORM entity
   */
  public static toOrm(domainEntity: Message): MessageOrmEntity {
    const ormEntity = new MessageOrmEntity();

    ormEntity.id = domainEntity.id;
    ormEntity.consultationId = domainEntity.consultationId;
    ormEntity.senderId = domainEntity.senderId;
    ormEntity.senderName = domainEntity.senderName;
    ormEntity.senderAvatar = domainEntity.senderAvatar;
    ormEntity.content = domainEntity.content;
    ormEntity.type = domainEntity.type;
    ormEntity.status = domainEntity.status;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.deliveredAt = domainEntity.deliveredAt;
    ormEntity.readAt = domainEntity.readAt;
    ormEntity.deletedAt = domainEntity.deletedAt;

    // Map attachments
    ormEntity.attachments = domainEntity.attachments.map((attachment) =>
      this.attachmentToOrm(attachment, domainEntity.id),
    );

    return ormEntity;
  }

  /**
   * Map MessageAttachment value object to ORM entity
   */
  private static attachmentToOrm(
    attachment: MessageAttachment,
    messageId: string,
  ): MessageAttachmentOrmEntity {
    const ormAttachment = new MessageAttachmentOrmEntity();

    ormAttachment.id = attachment.id;
    ormAttachment.messageId = messageId;
    ormAttachment.fileName = attachment.fileName;
    ormAttachment.fileUrl = attachment.fileUrl;
    ormAttachment.fileSize = attachment.fileSize;
    ormAttachment.mimeType = attachment.mimeType;
    ormAttachment.createdAt = attachment.createdAt;

    return ormAttachment;
  }

  /**
   * Map multiple ORM entities to Domain entities
   */
  public static toDomainMany(ormEntities: MessageOrmEntity[]): Message[] {
    return ormEntities.map((ormEntity) => this.toDomain(ormEntity));
  }

  /**
   * Map multiple Domain entities to ORM entities
   */
  public static toOrmMany(domainEntities: Message[]): MessageOrmEntity[] {
    return domainEntities.map((domainEntity) => this.toOrm(domainEntity));
  }
}
