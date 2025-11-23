import { ICommand } from '@nestjs/cqrs';

export class DeleteFaqCommand implements ICommand {
  constructor(public readonly faqId: string) {}
}
