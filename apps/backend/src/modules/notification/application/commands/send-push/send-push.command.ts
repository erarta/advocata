/**
 * Send Push Notification Command
 */
export class SendPushCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceToken: string,
    public readonly title: string,
    public readonly body: string,
    public readonly data?: Record<string, any>,
    public readonly metadata?: Record<string, any>,
  ) {}
}
