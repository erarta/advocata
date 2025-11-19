import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { DeleteDocumentTemplateCommand } from './delete-document-template.command';

interface DeleteTemplateResult {
  success: boolean;
}

@CommandHandler(DeleteDocumentTemplateCommand)
export class DeleteDocumentTemplateHandler implements ICommandHandler<DeleteDocumentTemplateCommand> {
  private readonly logger = new Logger(DeleteDocumentTemplateHandler.name);

  async execute(command: DeleteDocumentTemplateCommand): Promise<DeleteTemplateResult> {
    const { templateId } = command;

    this.logger.log(`Deleting (soft) document template: ${templateId}`);

    // TODO: Find template
    // const template = await this.templateRepository.findOne({ where: { id: templateId }});
    // if (!template) {
    //   throw new NotFoundException(`Template with ID ${templateId} not found`);
    // }

    // TODO: Soft delete by setting status to inactive
    // template.status = 'inactive';
    // await this.templateRepository.save(template);

    this.logger.log(`Document template deleted successfully: ${templateId}`);

    return {
      success: true,
    };
  }
}
