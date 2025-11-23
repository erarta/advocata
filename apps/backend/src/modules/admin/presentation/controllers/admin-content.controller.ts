import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../infrastructure/guards/admin-auth.guard';
import { AdminRoles } from '../../infrastructure/decorators/admin-roles.decorator';

// DTOs
import { GetDocumentTemplatesDto } from '../dtos/content/get-document-templates.dto';
import { CreateDocumentTemplateDto, UpdateDocumentTemplateDto } from '../dtos/content/document-template.dto';
import { GetFaqsDto } from '../dtos/content/get-faqs.dto';
import { CreateFaqDto, UpdateFaqDto } from '../dtos/content/faq.dto';
import { GetLegalInfoPagesDto, CreateLegalInfoPageDto, UpdateLegalInfoPageDto } from '../dtos/content/legal-info-page.dto';
import { GetSupportTicketsDto, AssignSupportTicketDto, ReplySupportTicketDto, UpdateSupportTicketStatusDto } from '../dtos/content/support-ticket.dto';
import { GetOnboardingSlidesDto, CreateOnboardingSlideDto, UpdateOnboardingSlideDto } from '../dtos/content/onboarding-slide.dto';

// Queries
import { GetDocumentTemplatesQuery } from '../../application/queries/content/get-document-templates';
import { GetDocumentTemplateQuery } from '../../application/queries/content/get-document-template';
import { GetFaqsQuery } from '../../application/queries/content/get-faqs';
import { GetLegalInfoPagesQuery } from '../../application/queries/content/get-legal-info-pages';
import { GetSupportTicketsQuery } from '../../application/queries/content/get-support-tickets';
import { GetSupportTicketQuery } from '../../application/queries/content/get-support-ticket';
import { GetOnboardingSlidesQuery } from '../../application/queries/content/get-onboarding-slides';
import { GetContentStatsQuery } from '../../application/queries/content/get-content-stats';

// Commands
import { CreateDocumentTemplateCommand } from '../../application/commands/content/create-document-template';
import { UpdateDocumentTemplateCommand } from '../../application/commands/content/update-document-template';
import { DeleteDocumentTemplateCommand } from '../../application/commands/content/delete-document-template';
import { CreateFaqCommand } from '../../application/commands/content/create-faq';
import { UpdateFaqCommand } from '../../application/commands/content/update-faq';
import { DeleteFaqCommand } from '../../application/commands/content/delete-faq';
import { CreateLegalInfoPageCommand } from '../../application/commands/content/create-legal-info-page';
import { UpdateLegalInfoPageCommand } from '../../application/commands/content/update-legal-info-page';
import { PublishLegalInfoPageCommand } from '../../application/commands/content/publish-legal-info-page';
import { AssignSupportTicketCommand } from '../../application/commands/content/assign-support-ticket';
import { ReplySupportTicketCommand } from '../../application/commands/content/reply-support-ticket';
import { UpdateSupportTicketStatusCommand } from '../../application/commands/content/update-support-ticket-status';
import { CreateOnboardingSlideCommand } from '../../application/commands/content/create-onboarding-slide';
import { UpdateOnboardingSlideCommand } from '../../application/commands/content/update-onboarding-slide';
import { DeleteOnboardingSlideCommand } from '../../application/commands/content/delete-onboarding-slide';

@ApiTags('admin/content')
@Controller('admin/content')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
@AdminRoles('admin', 'super_admin', 'content_manager')
export class AdminContentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ===== DOCUMENT TEMPLATES =====

  @Get('templates')
  @ApiOperation({ summary: 'Get all document templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates(@Query() query: GetDocumentTemplatesDto) {
    const result = await this.queryBus.execute(new GetDocumentTemplatesQuery(query));
    return result;
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get document template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  async getTemplate(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetDocumentTemplateQuery(id));
    return result;
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create new document template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(@Body() data: CreateDocumentTemplateDto) {
    const result = await this.commandBus.execute(new CreateDocumentTemplateCommand(data));
    return result;
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update document template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(@Param('id') id: string, @Body() data: UpdateDocumentTemplateDto) {
    const result = await this.commandBus.execute(new UpdateDocumentTemplateCommand(id, data));
    return result;
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete document template' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteTemplate(@Param('id') id: string) {
    const result = await this.commandBus.execute(new DeleteDocumentTemplateCommand(id));
    return result;
  }

  // ===== FAQ MANAGEMENT =====

  @Get('faqs')
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiResponse({ status: 200, description: 'FAQs retrieved successfully' })
  async getFaqs(@Query() query: GetFaqsDto) {
    const result = await this.queryBus.execute(new GetFaqsQuery(query));
    return result;
  }

  @Post('faqs')
  @ApiOperation({ summary: 'Create new FAQ' })
  @ApiResponse({ status: 201, description: 'FAQ created successfully' })
  async createFaq(@Body() data: CreateFaqDto) {
    const result = await this.commandBus.execute(new CreateFaqCommand(data));
    return result;
  }

  @Patch('faqs/:id')
  @ApiOperation({ summary: 'Update FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ updated successfully' })
  async updateFaq(@Param('id') id: string, @Body() data: UpdateFaqDto) {
    const result = await this.commandBus.execute(new UpdateFaqCommand(id, data));
    return result;
  }

  @Delete('faqs/:id')
  @ApiOperation({ summary: 'Delete FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteFaq(@Param('id') id: string) {
    const result = await this.commandBus.execute(new DeleteFaqCommand(id));
    return result;
  }

  // ===== LEGAL INFO PAGES =====

  @Get('legal-pages')
  @ApiOperation({ summary: 'Get all legal info pages' })
  @ApiResponse({ status: 200, description: 'Legal pages retrieved successfully' })
  async getLegalPages(@Query() query: GetLegalInfoPagesDto) {
    const result = await this.queryBus.execute(new GetLegalInfoPagesQuery(query));
    return result;
  }

  @Post('legal-pages')
  @ApiOperation({ summary: 'Create new legal info page' })
  @ApiResponse({ status: 201, description: 'Legal page created successfully' })
  async createLegalPage(@Body() data: CreateLegalInfoPageDto) {
    const result = await this.commandBus.execute(new CreateLegalInfoPageCommand(data));
    return result;
  }

  @Patch('legal-pages/:id')
  @ApiOperation({ summary: 'Update legal info page' })
  @ApiResponse({ status: 200, description: 'Legal page updated successfully' })
  async updateLegalPage(@Param('id') id: string, @Body() data: UpdateLegalInfoPageDto) {
    const result = await this.commandBus.execute(new UpdateLegalInfoPageCommand(id, data));
    return result;
  }

  @Post('legal-pages/:id/publish')
  @ApiOperation({ summary: 'Publish legal info page' })
  @ApiResponse({ status: 200, description: 'Legal page published successfully' })
  @HttpCode(HttpStatus.OK)
  async publishLegalPage(@Param('id') id: string) {
    const result = await this.commandBus.execute(new PublishLegalInfoPageCommand(id));
    return result;
  }

  // ===== SUPPORT TICKETS =====

  @Get('support-tickets')
  @ApiOperation({ summary: 'Get all support tickets' })
  @ApiResponse({ status: 200, description: 'Support tickets retrieved successfully' })
  async getSupportTickets(@Query() query: GetSupportTicketsDto) {
    const result = await this.queryBus.execute(new GetSupportTicketsQuery(query));
    return result;
  }

  @Get('support-tickets/:id')
  @ApiOperation({ summary: 'Get support ticket by ID' })
  @ApiResponse({ status: 200, description: 'Support ticket retrieved successfully' })
  async getSupportTicket(@Param('id') id: string) {
    const result = await this.queryBus.execute(new GetSupportTicketQuery(id));
    return result;
  }

  @Patch('support-tickets/:id/assign')
  @ApiOperation({ summary: 'Assign support ticket to admin' })
  @ApiResponse({ status: 200, description: 'Support ticket assigned successfully' })
  async assignSupportTicket(@Param('id') id: string, @Body() data: AssignSupportTicketDto) {
    const result = await this.commandBus.execute(new AssignSupportTicketCommand(id, data));
    return result;
  }

  @Post('support-tickets/:id/reply')
  @ApiOperation({ summary: 'Reply to support ticket' })
  @ApiResponse({ status: 200, description: 'Reply sent successfully' })
  @HttpCode(HttpStatus.OK)
  async replyToTicket(@Param('id') id: string, @Body() data: ReplySupportTicketDto) {
    const result = await this.commandBus.execute(new ReplySupportTicketCommand(id, data));
    return result;
  }

  @Patch('support-tickets/:id/status')
  @ApiOperation({ summary: 'Update support ticket status' })
  @ApiResponse({ status: 200, description: 'Support ticket status updated successfully' })
  async updateTicketStatus(@Param('id') id: string, @Body() data: UpdateSupportTicketStatusDto) {
    const result = await this.commandBus.execute(new UpdateSupportTicketStatusCommand(id, data));
    return result;
  }

  // ===== ONBOARDING SLIDES =====

  @Get('onboarding-slides')
  @ApiOperation({ summary: 'Get all onboarding slides' })
  @ApiResponse({ status: 200, description: 'Onboarding slides retrieved successfully' })
  async getOnboardingSlides(@Query() query: GetOnboardingSlidesDto) {
    const result = await this.queryBus.execute(new GetOnboardingSlidesQuery(query));
    return result;
  }

  @Post('onboarding-slides')
  @ApiOperation({ summary: 'Create new onboarding slide' })
  @ApiResponse({ status: 201, description: 'Onboarding slide created successfully' })
  async createOnboardingSlide(@Body() data: CreateOnboardingSlideDto) {
    const result = await this.commandBus.execute(new CreateOnboardingSlideCommand(data));
    return result;
  }

  @Patch('onboarding-slides/:id')
  @ApiOperation({ summary: 'Update onboarding slide' })
  @ApiResponse({ status: 200, description: 'Onboarding slide updated successfully' })
  async updateOnboardingSlide(@Param('id') id: string, @Body() data: UpdateOnboardingSlideDto) {
    const result = await this.commandBus.execute(new UpdateOnboardingSlideCommand(id, data));
    return result;
  }

  @Delete('onboarding-slides/:id')
  @ApiOperation({ summary: 'Delete onboarding slide' })
  @ApiResponse({ status: 200, description: 'Onboarding slide deleted successfully' })
  @HttpCode(HttpStatus.OK)
  async deleteOnboardingSlide(@Param('id') id: string) {
    const result = await this.commandBus.execute(new DeleteOnboardingSlideCommand(id));
    return result;
  }

  // ===== CONTENT STATISTICS =====

  @Get('stats')
  @ApiOperation({ summary: 'Get content statistics' })
  @ApiResponse({ status: 200, description: 'Content statistics retrieved successfully' })
  async getContentStats() {
    const result = await this.queryBus.execute(new GetContentStatsQuery());
    return result;
  }
}
