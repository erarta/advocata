export class UpdateRateLimitCommand {
  constructor(
    public readonly resource: string,
    public readonly method: string,
    public readonly role: string,
    public readonly limit: number,
    public readonly window: string,
    public readonly adminId?: string,
  ) {}
}
