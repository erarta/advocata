export class UpdateNotificationTemplateCommand {
  constructor(
    public readonly templateId: string,
    public readonly subject?: string,
    public readonly bodyText?: string,
    public readonly bodyHtml?: string,
    public readonly isActive?: boolean,
    public readonly adminId?: string,
  ) {}
}
