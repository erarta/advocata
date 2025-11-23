import { ConsultationStatus } from '../../../domain/enums';

/**
 * Get User Consultations Query
 *
 * Get all consultations for a client
 */
export class GetUserConsultationsQuery {
  constructor(
    public readonly clientId: string,
    public readonly status?: ConsultationStatus,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
