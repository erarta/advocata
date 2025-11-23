import { ICommand } from '@nestjs/cqrs';

export class DeleteOnboardingSlideCommand implements ICommand {
  constructor(public readonly slideId: string) {}
}
