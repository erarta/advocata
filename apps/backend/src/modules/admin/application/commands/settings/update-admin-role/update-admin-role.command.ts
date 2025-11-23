export class UpdateAdminRoleCommand {
  constructor(
    public readonly roleId: string,
    public readonly permissions: string[],
    public readonly adminId?: string,
  ) {}
}
