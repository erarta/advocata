/**
 * Get Consultation By ID Query
 *
 * Get a single consultation by ID
 */
export class GetConsultationByIdQuery {
  constructor(
    public readonly consultationId: string,
    public readonly userId: string, // To verify access
  ) {}
}
