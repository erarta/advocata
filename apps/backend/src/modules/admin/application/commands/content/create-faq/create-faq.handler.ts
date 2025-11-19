import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, BadRequestException } from '@nestjs/common';
import { CreateFaqCommand } from './create-faq.command';

interface CreateFaqResult {
  success: boolean;
  faqId: string;
}

@CommandHandler(CreateFaqCommand)
export class CreateFaqHandler implements ICommandHandler<CreateFaqCommand> {
  private readonly logger = new Logger(CreateFaqHandler.name);

  async execute(command: CreateFaqCommand): Promise<CreateFaqResult> {
    const { question, answer, category, order } = command.dto;

    this.logger.log(`Creating FAQ: ${question.substring(0, 50)}...`);

    // Validation
    if (question.length < 10) {
      throw new BadRequestException('Question must be at least 10 characters');
    }

    if (answer.length < 20) {
      throw new BadRequestException('Answer must be at least 20 characters');
    }

    // TODO: Create FAQ in database
    // const maxOrder = order ?? (await this.getMaxOrder(category)) + 1;
    // const faq = this.faqRepository.create({
    //   question,
    //   answer,
    //   category,
    //   order: maxOrder,
    //   status: 'active',
    //   viewCount: 0,
    //   helpfulCount: 0,
    //   notHelpfulCount: 0,
    // });
    // await this.faqRepository.save(faq);

    const faqId = `faq-${Date.now()}`;

    this.logger.log(`FAQ created successfully: ${faqId}`);

    return {
      success: true,
      faqId,
    };
  }
}
