/**
 * Get Messages Query
 *
 * Query to retrieve messages for a consultation with pagination.
 */
export class GetMessagesQuery {
  constructor(
    public readonly consultationId: string,
    public readonly userId: string,
    public readonly includeDeleted: boolean = false,
    public readonly limit: number = 50,
    public readonly offset: number = 0,
  ) {}
}
