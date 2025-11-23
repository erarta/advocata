/**
 * Start Consultation Command
 *
 * Start a confirmed consultation
 */
export class StartConsultationCommand {
  constructor(
    public readonly consultationId: string,
    public readonly userId: string, // Can be client or lawyer
  ) {}
}
