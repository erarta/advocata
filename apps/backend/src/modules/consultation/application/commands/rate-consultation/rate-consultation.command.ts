/**
 * Rate Consultation Command
 *
 * Client rates a completed consultation
 */
export class RateConsultationCommand {
  constructor(
    public readonly consultationId: string,
    public readonly clientId: string,
    public readonly rating: number,
    public readonly review?: string,
  ) {}
}
