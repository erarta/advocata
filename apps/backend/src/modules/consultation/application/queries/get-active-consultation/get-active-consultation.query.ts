/**
 * Get Active Consultation Query
 *
 * Get the active consultation for a user
 */
export class GetActiveConsultationQuery {
  constructor(
    public readonly userId: string,
    public readonly isLawyer: boolean, // true if user is lawyer, false if client
  ) {}
}
