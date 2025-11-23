import { IQuery } from '@nestjs/cqrs';
import { GetDocumentTemplatesDto } from '../../../../presentation/dtos/content/get-document-templates.dto';

export class GetDocumentTemplatesQuery implements IQuery {
  constructor(public readonly dto: GetDocumentTemplatesDto) {}
}
