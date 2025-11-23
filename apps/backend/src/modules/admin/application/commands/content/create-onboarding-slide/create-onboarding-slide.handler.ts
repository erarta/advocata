import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateOnboardingSlideCommand } from './create-onboarding-slide.command';

interface CreateSlideResult {
  success: boolean;
  slideId: string;
}

@CommandHandler(CreateOnboardingSlideCommand)
export class CreateOnboardingSlideHandler implements ICommandHandler<CreateOnboardingSlideCommand> {
  private readonly logger = new Logger(CreateOnboardingSlideHandler.name);

  async execute(command: CreateOnboardingSlideCommand): Promise<CreateSlideResult> {
    const { targetAudience, title, description, imageUrl, buttonText, order } = command.dto;

    this.logger.log(`Creating onboarding slide: ${title}`);

    // TODO: Create slide in database
    // const slide = this.slideRepository.create({
    //   targetAudience,
    //   title,
    //   description,
    //   imageUrl,
    //   buttonText,
    //   order,
    //   status: 'active',
    // });
    // await this.slideRepository.save(slide);

    const slideId = `slide-${Date.now()}`;

    this.logger.log(`Onboarding slide created successfully: ${slideId}`);

    return {
      success: true,
      slideId,
    };
  }
}
