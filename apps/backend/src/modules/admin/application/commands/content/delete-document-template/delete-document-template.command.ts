import { ICommand } from '@nestjs/cqrs';

export class DeleteDocumentTemplateCommand implements ICommand {
  constructor(public readonly templateId: string) {}
}
