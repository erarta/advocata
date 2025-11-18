/**
 * Delete Message Command
 *
 * Command to soft-delete a message.
 * Only the sender can delete their own message.
 */
export class DeleteMessageCommand {
  constructor(
    public readonly messageId: string,
    public readonly userId: string,
  ) {}
}
