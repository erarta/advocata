export class UpdateEmailConfigCommand {
  constructor(
    public readonly provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses',
    public readonly isEnabled?: boolean,
    public readonly fromEmail?: string,
    public readonly fromName?: string,
    public readonly replyToEmail?: string,
    public readonly smtpHost?: string,
    public readonly smtpPort?: number,
    public readonly smtpSecure?: boolean,
    public readonly smtpUsername?: string,
    public readonly smtpPassword?: string,
    public readonly apiKey?: string,
    public readonly adminId?: string,
  ) {}
}
