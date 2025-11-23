/**
 * Send Email Command
 */
export class SendEmailCommand {
  constructor(
    public readonly userId: string,
    public readonly to: string,
    public readonly subject: string,
    public readonly body: string,
    public readonly html?: string,
    public readonly templateId?: string,
    public readonly templateData?: Record<string, any>,
    public readonly metadata?: Record<string, any>,
  ) {}
}
