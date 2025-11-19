import { IQuery } from '@nestjs/cqrs';
import { UserGrowthDto } from '../../../../presentation/dtos/analytics/user-growth.dto';

export class GetUserGrowthQuery implements IQuery {
  constructor(public readonly dto: UserGrowthDto) {}
}
