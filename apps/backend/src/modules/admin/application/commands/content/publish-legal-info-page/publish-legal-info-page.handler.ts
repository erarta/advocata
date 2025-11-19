import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PublishLegalInfoPageCommand } from './publish-legal-info-page.command';

interface PublishPageResult {
  success: boolean;
}

@CommandHandler(PublishLegalInfoPageCommand)
export class PublishLegalInfoPageHandler implements ICommandHandler<PublishLegalInfoPageCommand> {
  private readonly logger = new Logger(PublishLegalInfoPageHandler.name);

  async execute(command: PublishLegalInfoPageCommand): Promise<PublishPageResult> {
    const { pageId } = command;

    this.logger.log(`Publishing legal info page: ${pageId}`);

    // TODO: Find page
    // const page = await this.pageRepository.findOne({ where: { id: pageId }});
    // if (!page) {
    //   throw new NotFoundException(`Page with ID ${pageId} not found`);
    // }

    // TODO: Validate page is ready to publish
    // if (page.status === 'published') {
    //   throw new BadRequestException('Page is already published');
    // }

    // TODO: Publish page
    // page.status = 'published';
    // page.publishedAt = new Date();
    // await this.pageRepository.save(page);

    this.logger.log(`Legal info page published successfully: ${pageId}`);

    return {
      success: true,
    };
  }
}
