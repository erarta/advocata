import { ICommand } from '@nestjs/cqrs';

export class ActivateUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly notes?: string,
  ) {}
}
