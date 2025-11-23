import { ICommand } from '@nestjs/cqrs';
import { CreateOnboardingSlideDto } from '../../../../presentation/dtos/content/onboarding-slide.dto';

export class CreateOnboardingSlideCommand implements ICommand {
  constructor(public readonly dto: CreateOnboardingSlideDto) {}
}
