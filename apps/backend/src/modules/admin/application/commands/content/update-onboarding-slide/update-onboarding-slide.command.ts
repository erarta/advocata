import { ICommand } from '@nestjs/cqrs';
import { UpdateOnboardingSlideDto } from '../../../../presentation/dtos/content/onboarding-slide.dto';

export class UpdateOnboardingSlideCommand implements ICommand {
  constructor(
    public readonly slideId: string,
    public readonly dto: UpdateOnboardingSlideDto,
  ) {}
}
