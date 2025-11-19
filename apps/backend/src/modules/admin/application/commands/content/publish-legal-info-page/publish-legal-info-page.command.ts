import { ICommand } from '@nestjs/cqrs';

export class PublishLegalInfoPageCommand implements ICommand {
  constructor(public readonly pageId: string) {}
}
