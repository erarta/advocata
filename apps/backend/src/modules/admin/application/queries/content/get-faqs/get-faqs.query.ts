import { IQuery } from '@nestjs/cqrs';
import { GetFaqsDto } from '../../../../presentation/dtos/content/get-faqs.dto';

export class GetFaqsQuery implements IQuery {
  constructor(public readonly dto: GetFaqsDto) {}
}
