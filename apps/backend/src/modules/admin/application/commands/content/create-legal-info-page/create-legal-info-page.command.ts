import { ICommand } from '@nestjs/cqrs';
import { CreateLegalInfoPageDto } from '../../../../presentation/dtos/content/legal-info-page.dto';

export class CreateLegalInfoPageCommand implements ICommand {
  constructor(public readonly dto: CreateLegalInfoPageDto) {}
}
