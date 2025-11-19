import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { DeleteOnboardingSlideCommand } from './delete-onboarding-slide.command';

interface DeleteSlideResult {
  success: boolean;
}

@CommandHandler(DeleteOnboardingSlideCommand)
export class DeleteOnboardingSlideHandler implements ICommandHandler<DeleteOnboardingSlideCommand> {
  private readonly logger = new Logger(DeleteOnboardingSlideHandler.name);

  async execute(command: DeleteOnboardingSlideCommand): Promise<DeleteSlideResult> {
    const { slideId } = command;

    this.logger.log(`Deleting onboarding slide: ${slideId}`);

    // TODO: Find slide
    // const slide = await this.slideRepository.findOne({ where: { id: slideId }});
    // if (!slide) {
    //   throw new NotFoundException(`Slide with ID ${slideId} not found`);
    // }

    // TODO: Hard delete
    // await this.slideRepository.remove(slide);

    this.logger.log(`Onboarding slide deleted successfully: ${slideId}`);

    return {
      success: true,
    };
  }
}
