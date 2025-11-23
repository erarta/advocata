import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, BadRequestException } from '@nestjs/common';
import { CreateLegalInfoPageCommand } from './create-legal-info-page.command';

interface CreatePageResult {
  success: boolean;
  pageId: string;
}

@CommandHandler(CreateLegalInfoPageCommand)
export class CreateLegalInfoPageHandler implements ICommandHandler<CreateLegalInfoPageCommand> {
  private readonly logger = new Logger(CreateLegalInfoPageHandler.name);

  async execute(command: CreateLegalInfoPageCommand): Promise<CreatePageResult> {
    const { title, slug, content, type, seoTitle, seoDescription, seoKeywords } = command.dto;

    this.logger.log(`Creating legal info page: ${title}`);

    // Validation
    if (content.length < 100) {
      throw new BadRequestException('Content must be at least 100 characters');
    }

    // TODO: Check if slug is unique
    // const existingPage = await this.pageRepository.findOne({ where: { slug }});
    // if (existingPage) {
    //   throw new BadRequestException('Page with this slug already exists');
    // }

    // TODO: Create page in database
    // const page = this.pageRepository.create({
    //   title,
    //   slug,
    //   content,
    //   type,
    //   status: 'draft',
    //   seoTitle,
    //   seoDescription,
    //   seoKeywords,
    //   version: 1,
    // });
    // await this.pageRepository.save(page);

    const pageId = `page-${Date.now()}`;

    this.logger.log(`Legal info page created successfully: ${pageId}`);

    return {
      success: true,
      pageId,
    };
  }
}
