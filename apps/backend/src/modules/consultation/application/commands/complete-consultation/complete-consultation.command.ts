/**
 * Complete Consultation Command
 *
 * Complete an active consultation
 */
export class CompleteConsultationCommand {
  constructor(
    public readonly consultationId: string,
    public readonly userId: string, // Can be client or lawyer
  ) {}
}
