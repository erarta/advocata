import { IQuery } from '@nestjs/cqrs';

export class GetDocumentTemplateQuery implements IQuery {
  constructor(public readonly templateId: string) {}
}
