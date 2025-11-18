import { ConsultationStatus } from '../../../domain/enums';

/**
 * Get Lawyer Consultations Query
 *
 * Get all consultations for a lawyer
 */
export class GetLawyerConsultationsQuery {
  constructor(
    public readonly lawyerId: string,
    public readonly status?: ConsultationStatus,
    public readonly limit?: number,
    public readonly offset?: number,
  ) {}
}
