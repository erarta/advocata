/**
 * Send SMS Command
 */
export class SendSmsCommand {
  constructor(
    public readonly userId: string,
    public readonly to: string,
    public readonly message: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}
