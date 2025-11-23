import { ICommand } from '@nestjs/cqrs';
import { UpdateFaqDto } from '../../../../presentation/dtos/content/faq.dto';

export class UpdateFaqCommand implements ICommand {
  constructor(
    public readonly faqId: string,
    public readonly dto: UpdateFaqDto,
  ) {}
}
