import { ICommand } from '@nestjs/cqrs';
import { UpdateLegalInfoPageDto } from '../../../../presentation/dtos/content/legal-info-page.dto';

export class UpdateLegalInfoPageCommand implements ICommand {
  constructor(
    public readonly pageId: string,
    public readonly dto: UpdateLegalInfoPageDto,
  ) {}
}
