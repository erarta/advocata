import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdateOnboardingSlideCommand } from './update-onboarding-slide.command';

interface UpdateSlideResult {
  success: boolean;
}

@CommandHandler(UpdateOnboardingSlideCommand)
export class UpdateOnboardingSlideHandler implements ICommandHandler<UpdateOnboardingSlideCommand> {
  private readonly logger = new Logger(UpdateOnboardingSlideHandler.name);

  async execute(command: UpdateOnboardingSlideCommand): Promise<UpdateSlideResult> {
    const { slideId, dto } = command;

    this.logger.log(`Updating onboarding slide: ${slideId}`);

    // TODO: Find slide
    // const slide = await this.slideRepository.findOne({ where: { id: slideId }});
    // if (!slide) {
    //   throw new NotFoundException(`Slide with ID ${slideId} not found`);
    // }

    // TODO: Update fields
    // if (dto.targetAudience) slide.targetAudience = dto.targetAudience;
    // if (dto.title) slide.title = dto.title;
    // if (dto.description) slide.description = dto.description;
    // if (dto.imageUrl) slide.imageUrl = dto.imageUrl;
    // if (dto.buttonText !== undefined) slide.buttonText = dto.buttonText;
    // if (dto.order !== undefined) slide.order = dto.order;
    // if (dto.status) slide.status = dto.status;

    // await this.slideRepository.save(slide);

    this.logger.log(`Onboarding slide updated successfully: ${slideId}`);

    return {
      success: true,
    };
  }
}
