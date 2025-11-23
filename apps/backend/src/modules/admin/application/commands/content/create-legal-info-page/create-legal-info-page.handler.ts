import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, BadRequestException } from '@nestjs/common';
import { CreateLegalInfoPageCommand } from './create-legal-info-page.command';
import { LegalPageRepository } from '../../../../infrastructure/persistence/legal-page.repository';
import { LegalPageOrmEntity, LegalPageStatus } from '../../../../infrastructure/persistence/legal-page.orm-entity';
import { AuditLogService } from '../../../services/audit-log.service';
import { AuditAction, AuditEntityType } from '../../../../infrastructure/persistence/audit-log.orm-entity';

interface CreatePageResult {
  success: boolean;
  pageId: string;
}

@CommandHandler(CreateLegalInfoPageCommand)
export class CreateLegalInfoPageHandler implements ICommandHandler<CreateLegalInfoPageCommand> {
  private readonly logger = new Logger(CreateLegalInfoPageHandler.name);

  constructor(
    private readonly legalPageRepository: LegalPageRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(command: CreateLegalInfoPageCommand): Promise<CreatePageResult> {
    const { title, slug, content, type, seoTitle, seoDescription, seoKeywords } = command.dto;

    this.logger.log(`Creating legal info page: ${title}`);

    // Validation
    if (content.length < 100) {
      throw new BadRequestException('Content must be at least 100 characters');
    }

    // Check if slug is unique
    const existingPage = await this.legalPageRepository.findBySlug(slug);
    if (existingPage) {
      throw new BadRequestException('Page with this slug already exists');
    }

    // Create page in database
    const pageId = await this.legalPageRepository.nextId();

    const page = new LegalPageOrmEntity();
    page.id = pageId;
    page.title = title;
    page.slug = slug;
    page.content = content;
    page.type = type as any;
    page.status = LegalPageStatus.DRAFT;
    page.seoTitle = seoTitle;
    page.seoDescription = seoDescription;
    page.seoKeywords = seoKeywords;
    page.version = 1;

    await this.legalPageRepository.save(page);

    // Log audit trail
    await this.auditLogService.logContentChange(
      'system', // TODO: Get admin user ID from context
      AuditAction.CREATE,
      AuditEntityType.LEGAL_PAGE,
      pageId,
      undefined,
      { title, slug, type, status: LegalPageStatus.DRAFT },
    );

    this.logger.log(`Legal info page created successfully: ${pageId}`);

    return {
      success: true,
      pageId,
    };
  }
}
