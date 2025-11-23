/**
 * Get Unread Count Query
 *
 * Query to get count of unread messages for a user.
 * Can be scoped to a specific consultation or all consultations.
 */
export class GetUnreadCountQuery {
  constructor(
    public readonly userId: string,
    public readonly consultationId?: string,
  ) {}
}
