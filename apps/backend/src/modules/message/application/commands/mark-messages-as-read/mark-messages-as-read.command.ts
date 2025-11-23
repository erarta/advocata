/**
 * Mark Messages As Read Command
 *
 * Command to mark all unread messages in a consultation as read.
 */
export class MarkMessagesAsReadCommand {
  constructor(
    public readonly consultationId: string,
    public readonly userId: string,
  ) {}
}
