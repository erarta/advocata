import { IQuery } from '@nestjs/cqrs';
import { GetLawyersDto } from '../../../../presentation/dtos/lawyers/get-lawyers.dto';

export class GetLawyersQuery implements IQuery {
  constructor(public readonly dto: GetLawyersDto) {}
}
