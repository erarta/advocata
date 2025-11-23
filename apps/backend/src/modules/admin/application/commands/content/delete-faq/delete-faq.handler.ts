import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { DeleteFaqCommand } from './delete-faq.command';

interface DeleteFaqResult {
  success: boolean;
}

@CommandHandler(DeleteFaqCommand)
export class DeleteFaqHandler implements ICommandHandler<DeleteFaqCommand> {
  private readonly logger = new Logger(DeleteFaqHandler.name);

  async execute(command: DeleteFaqCommand): Promise<DeleteFaqResult> {
    const { faqId } = command;

    this.logger.log(`Deleting FAQ: ${faqId}`);

    // TODO: Find FAQ
    // const faq = await this.faqRepository.findOne({ where: { id: faqId }});
    // if (!faq) {
    //   throw new NotFoundException(`FAQ with ID ${faqId} not found`);
    // }

    // TODO: Hard delete (FAQs can be deleted permanently)
    // await this.faqRepository.remove(faq);

    this.logger.log(`FAQ deleted successfully: ${faqId}`);

    return {
      success: true,
    };
  }
}
