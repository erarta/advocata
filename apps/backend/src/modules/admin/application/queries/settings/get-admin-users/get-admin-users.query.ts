export class GetAdminUsersQuery {
  constructor(
    public readonly role?: string,
    public readonly status?: string,
    public readonly search?: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
  ) {}
}
