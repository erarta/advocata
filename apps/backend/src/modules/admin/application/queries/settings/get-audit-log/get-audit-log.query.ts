export class GetAuditLogQuery {
  constructor(
    public readonly adminId?: string,
    public readonly action?: string,
    public readonly resource?: string,
    public readonly dateFrom?: Date,
    public readonly dateTo?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 50,
  ) {}
}
