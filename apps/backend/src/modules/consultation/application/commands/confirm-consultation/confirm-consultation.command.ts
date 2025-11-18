/**
 * Confirm Consultation Command
 *
 * Lawyer confirms a pending consultation
 */
export class ConfirmConsultationCommand {
  constructor(
    public readonly consultationId: string,
    public readonly lawyerId: string,
  ) {}
}
