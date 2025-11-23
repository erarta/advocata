import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdateLegalInfoPageCommand } from './update-legal-info-page.command';

interface UpdatePageResult {
  success: boolean;
}

@CommandHandler(UpdateLegalInfoPageCommand)
export class UpdateLegalInfoPageHandler implements ICommandHandler<UpdateLegalInfoPageCommand> {
  private readonly logger = new Logger(UpdateLegalInfoPageHandler.name);

  async execute(command: UpdateLegalInfoPageCommand): Promise<UpdatePageResult> {
    const { pageId, dto } = command;

    this.logger.log(`Updating legal info page: ${pageId}`);

    // TODO: Find page
    // const page = await this.pageRepository.findOne({ where: { id: pageId }});
    // if (!page) {
    //   throw new NotFoundException(`Page with ID ${pageId} not found`);
    // }

    // TODO: Update fields
    // if (dto.title) page.title = dto.title;
    // if (dto.slug) page.slug = dto.slug;
    // if (dto.content) {
    //   page.content = dto.content;
    //   page.version += 1; // Increment version on content change
    // }
    // if (dto.type) page.type = dto.type;
    // if (dto.status) page.status = dto.status;
    // if (dto.seoTitle !== undefined) page.seoTitle = dto.seoTitle;
    // if (dto.seoDescription !== undefined) page.seoDescription = dto.seoDescription;
    // if (dto.seoKeywords !== undefined) page.seoKeywords = dto.seoKeywords;

    // await this.pageRepository.save(page);

    this.logger.log(`Legal info page updated successfully: ${pageId}`);

    return {
      success: true,
    };
  }
}
