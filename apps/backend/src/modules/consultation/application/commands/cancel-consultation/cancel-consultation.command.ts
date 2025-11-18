/**
 * Cancel Consultation Command
 *
 * Cancel a consultation
 */
export class CancelConsultationCommand {
  constructor(
    public readonly consultationId: string,
    public readonly userId: string,
    public readonly cancellationReason: string,
  ) {}
}
