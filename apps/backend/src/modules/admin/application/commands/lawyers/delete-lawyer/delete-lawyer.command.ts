import { ICommand } from '@nestjs/cqrs';

export class DeleteLawyerCommand implements ICommand {
  constructor(public readonly lawyerId: string) {}
}
