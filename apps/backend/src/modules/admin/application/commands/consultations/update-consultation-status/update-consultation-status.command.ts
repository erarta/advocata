import { ICommand } from '@nestjs/cqrs';
import { UpdateConsultationStatusDto } from '../../../../presentation/dtos/consultations/update-consultation-status.dto';

export class UpdateConsultationStatusCommand implements ICommand {
  constructor(
    public readonly consultationId: string,
    public readonly dto: UpdateConsultationStatusDto,
  ) {}
}
