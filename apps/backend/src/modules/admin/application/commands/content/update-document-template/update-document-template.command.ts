import { ICommand } from '@nestjs/cqrs';
import { UpdateDocumentTemplateDto } from '../../../../presentation/dtos/content/document-template.dto';

export class UpdateDocumentTemplateCommand implements ICommand {
  constructor(
    public readonly templateId: string,
    public readonly dto: UpdateDocumentTemplateDto,
  ) {}
}
