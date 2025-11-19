import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, BadRequestException } from '@nestjs/common';
import { CreateDocumentTemplateCommand } from './create-document-template.command';

interface CreateTemplateResult {
  success: boolean;
  templateId: string;
}

@CommandHandler(CreateDocumentTemplateCommand)
export class CreateDocumentTemplateHandler implements ICommandHandler<CreateDocumentTemplateCommand> {
  private readonly logger = new Logger(CreateDocumentTemplateHandler.name);

  async execute(command: CreateDocumentTemplateCommand): Promise<CreateTemplateResult> {
    const { title, description, category, content, isPublic, tags } = command.dto;

    this.logger.log(`Creating document template: ${title}`);

    // Validation
    if (title.length < 3) {
      throw new BadRequestException('Title must be at least 3 characters');
    }

    if (content.length < 100) {
      throw new BadRequestException('Content must be at least 100 characters');
    }

    // TODO: Check if title is unique
    // const existingTemplate = await this.templateRepository.findOne({ where: { title }});
    // if (existingTemplate) {
    //   throw new BadRequestException('Template with this title already exists');
    // }

    // TODO: Create template in database
    // const template = this.templateRepository.create({
    //   title,
    //   description,
    //   category,
    //   content,
    //   isPublic: isPublic ?? true,
    //   tags: tags || [],
    //   status: 'draft',
    //   version: 1,
    //   downloadCount: 0,
    // });
    // await this.templateRepository.save(template);

    const templateId = `template-${Date.now()}`;

    this.logger.log(`Document template created successfully: ${templateId}`);

    return {
      success: true,
      templateId,
    };
  }
}
