/**
 * Notification Response DTO
 */
export class NotificationResponseDto {
  id: string;
  userId: string;
  type: string;
  status: string;
  recipient: string;
  subject?: string;
  body: string;
  error?: string;
  externalId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  static fromDomain(notification: any): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type.value,
      status: notification.status.value,
      recipient: notification.recipient,
      subject: notification.subject,
      body: notification.body,
      error: notification.error,
      externalId: notification.externalId,
      sentAt: notification.sentAt,
      deliveredAt: notification.deliveredAt,
      failedAt: notification.failedAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
