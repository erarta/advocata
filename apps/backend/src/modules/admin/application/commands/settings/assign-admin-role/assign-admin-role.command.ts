export class AssignAdminRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly roleId: string,
    public readonly adminId?: string,
  ) {}
}
