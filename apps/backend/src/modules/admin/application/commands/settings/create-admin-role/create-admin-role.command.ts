export class CreateAdminRoleCommand {
  constructor(
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly permissions: string[],
    public readonly adminId?: string,
  ) {}
}
