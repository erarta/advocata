/**
 * ApproveLawyerCommand
 *
 * Command to approve lawyer verification
 */
export class ApproveLawyerCommand {
  constructor(
    public readonly lawyerId: string,
    public readonly notes?: string,
  ) {}
}
