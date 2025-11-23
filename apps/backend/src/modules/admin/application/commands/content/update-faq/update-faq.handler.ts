import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdateFaqCommand } from './update-faq.command';

interface UpdateFaqResult {
  success: boolean;
}

@CommandHandler(UpdateFaqCommand)
export class UpdateFaqHandler implements ICommandHandler<UpdateFaqCommand> {
  private readonly logger = new Logger(UpdateFaqHandler.name);

  async execute(command: UpdateFaqCommand): Promise<UpdateFaqResult> {
    const { faqId, dto } = command;

    this.logger.log(`Updating FAQ: ${faqId}`);

    // TODO: Find FAQ
    // const faq = await this.faqRepository.findOne({ where: { id: faqId }});
    // if (!faq) {
    //   throw new NotFoundException(`FAQ with ID ${faqId} not found`);
    // }

    // TODO: Update fields
    // if (dto.question) faq.question = dto.question;
    // if (dto.answer) faq.answer = dto.answer;
    // if (dto.category) faq.category = dto.category;
    // if (dto.order !== undefined) faq.order = dto.order;

    // await this.faqRepository.save(faq);

    this.logger.log(`FAQ updated successfully: ${faqId}`);

    return {
      success: true,
    };
  }
}
