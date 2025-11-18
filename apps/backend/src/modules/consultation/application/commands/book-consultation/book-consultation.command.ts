import { ConsultationType } from '../../../domain/enums';

/**
 * Book Consultation Command
 */
export class BookConsultationCommand {
  constructor(
    public readonly clientId: string,
    public readonly lawyerId: string,
    public readonly type: ConsultationType,
    public readonly description: string,
    public readonly scheduledStart?: Date,
    public readonly scheduledEnd?: Date,
  ) {}
}
