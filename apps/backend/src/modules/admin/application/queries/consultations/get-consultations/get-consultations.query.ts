import { IQuery } from '@nestjs/cqrs';
import { GetConsultationsDto } from '../../../../presentation/dtos/consultations/get-consultations.dto';

export class GetConsultationsQuery implements IQuery {
  constructor(public readonly dto: GetConsultationsDto) {}
}
