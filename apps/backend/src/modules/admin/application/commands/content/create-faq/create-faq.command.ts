import { ICommand } from '@nestjs/cqrs';
import { CreateFaqDto } from '../../../../presentation/dtos/content/faq.dto';

export class CreateFaqCommand implements ICommand {
  constructor(public readonly dto: CreateFaqDto) {}
}
