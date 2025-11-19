import { ICommand } from '@nestjs/cqrs';
import { CreateDocumentTemplateDto } from '../../../../presentation/dtos/content/document-template.dto';

export class CreateDocumentTemplateCommand implements ICommand {
  constructor(public readonly dto: CreateDocumentTemplateDto) {}
}
