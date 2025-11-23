import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { UpdateDocumentTemplateCommand } from './update-document-template.command';

interface UpdateTemplateResult {
  success: boolean;
}

@CommandHandler(UpdateDocumentTemplateCommand)
export class UpdateDocumentTemplateHandler implements ICommandHandler<UpdateDocumentTemplateCommand> {
  private readonly logger = new Logger(UpdateDocumentTemplateHandler.name);

  async execute(command: UpdateDocumentTemplateCommand): Promise<UpdateTemplateResult> {
    const { templateId, dto } = command;

    this.logger.log(`Updating document template: ${templateId}`);

    // TODO: Find template
    // const template = await this.templateRepository.findOne({ where: { id: templateId }});
    // if (!template) {
    //   throw new NotFoundException(`Template with ID ${templateId} not found`);
    // }

    // TODO: Update fields
    // if (dto.title) template.title = dto.title;
    // if (dto.description) template.description = dto.description;
    // if (dto.category) template.category = dto.category;
    // if (dto.content) {
    //   template.content = dto.content;
    //   template.version += 1; // Increment version on content change
    // }
    // if (dto.isPublic !== undefined) template.isPublic = dto.isPublic;
    // if (dto.tags) template.tags = dto.tags;

    // await this.templateRepository.save(template);

    this.logger.log(`Document template updated successfully: ${templateId}`);

    return {
      success: true,
    };
  }
}
