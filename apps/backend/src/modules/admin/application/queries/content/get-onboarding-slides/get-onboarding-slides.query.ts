import { IQuery } from '@nestjs/cqrs';
import { GetOnboardingSlidesDto } from '../../../../presentation/dtos/content/onboarding-slide.dto';

export class GetOnboardingSlidesQuery implements IQuery {
  constructor(public readonly dto: GetOnboardingSlidesDto) {}
}
