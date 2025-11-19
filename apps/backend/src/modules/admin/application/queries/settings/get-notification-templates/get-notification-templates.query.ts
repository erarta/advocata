export class GetNotificationTemplatesQuery {
  constructor(
    public readonly type?: 'email' | 'sms' | 'push',
    public readonly category?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
