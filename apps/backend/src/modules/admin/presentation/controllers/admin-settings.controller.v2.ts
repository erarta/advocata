import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../../infrastructure/guards/admin-auth.guard';
import { AdminRoles } from '../../infrastructure/decorators/admin-roles.decorator';

// Import DTOs
import { UpdatePlatformConfigDto } from '../dtos/settings/platform-config.dto';
import { UpdateFeatureFlagDto } from '../dtos/settings/feature-flag.dto';
import { UpdateNotificationTemplateDto } from '../dtos/settings/notification-template.dto';
import { UpdateEmailConfigDto } from '../dtos/settings/email-config.dto';
import { UpdateSMSConfigDto } from '../dtos/settings/sms-config.dto';
import { UpdateRateLimitDto } from '../dtos/settings/rate-limit.dto';
import {
  CreateAdminRoleDto,
  UpdateAdminRoleDto,
  AssignAdminRoleDto,
} from '../dtos/settings/admin-role.dto';

// Import Queries
import { GetPlatformConfigQuery } from '../../application/queries/settings/get-platform-config';
import { GetFeatureFlagsQuery } from '../../application/queries/settings/get-feature-flags';
import { GetNotificationTemplatesQuery } from '../../application/queries/settings/get-notification-templates';
import { GetNotificationTemplateQuery } from '../../application/queries/settings/get-notification-template';
import { GetRateLimitsQuery } from '../../application/queries/settings/get-rate-limits';
import { GetAdminRolesQuery } from '../../application/queries/settings/get-admin-roles';
import { GetAdminUsersQuery } from '../../application/queries/settings/get-admin-users';
import { GetAuditLogQuery } from '../../application/queries/settings/get-audit-log';
import { GetAuditLogStatsQuery } from '../../application/queries/settings/get-audit-log-stats';
import { GetEmailConfigQuery } from '../../application/queries/settings/get-email-config';
import { GetSMSConfigQuery } from '../../application/queries/settings/get-sms-config';
import { GetSystemHealthQuery } from '../../application/queries/settings/get-system-health';

// Import Commands
import { UpdatePlatformConfigCommand } from '../../application/commands/settings/update-platform-config';
import { UpdateFeatureFlagCommand } from '../../application/commands/settings/update-feature-flag';
import { UpdateNotificationTemplateCommand } from '../../application/commands/settings/update-notification-template';
import { UpdateEmailConfigCommand } from '../../application/commands/settings/update-email-config';
import { UpdateSMSConfigCommand } from '../../application/commands/settings/update-sms-config';
import { UpdateRateLimitCommand } from '../../application/commands/settings/update-rate-limit';
import { CreateAdminRoleCommand } from '../../application/commands/settings/create-admin-role';
import { UpdateAdminRoleCommand } from '../../application/commands/settings/update-admin-role';
import { AssignAdminRoleCommand } from '../../application/commands/settings/assign-admin-role';

@ApiTags('admin/settings')
@Controller('admin/settings')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
@AdminRoles('super_admin') // Most settings require super_admin
export class AdminSettingsControllerV2 {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ===== PLATFORM CONFIGURATION =====

  @Get('platform')
  @ApiOperation({ summary: 'Get platform configuration' })
  @ApiResponse({
    status: 200,
    description: 'Platform configuration retrieved successfully',
  })
  async getPlatformConfig() {
    const query = new GetPlatformConfigQuery();
    return await this.queryBus.execute(query);
  }

  @Patch('platform')
  @ApiOperation({ summary: 'Update platform configuration' })
  @ApiResponse({
    status: 200,
    description: 'Platform configuration updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async updatePlatformConfig(@Body() dto: UpdatePlatformConfigDto) {
    const command = new UpdatePlatformConfigCommand(dto, 'admin_001'); // TODO: Get from auth context
    return await this.commandBus.execute(command);
  }

  // ===== FEATURE FLAGS =====

  @Get('feature-flags')
  @ApiOperation({ summary: 'Get all feature flags' })
  @ApiResponse({
    status: 200,
    description: 'Feature flags retrieved successfully',
  })
  async getFeatureFlags() {
    const query = new GetFeatureFlagsQuery();
    return await this.queryBus.execute(query);
  }

  @Patch('feature-flags/:key')
  @ApiOperation({ summary: 'Toggle feature flag' })
  @ApiResponse({ status: 200, description: 'Feature flag updated successfully' })
  @HttpCode(HttpStatus.OK)
  async updateFeatureFlag(
    @Param('key') key: string,
    @Body() dto: UpdateFeatureFlagDto,
  ) {
    const command = new UpdateFeatureFlagCommand(
      key,
      dto.enabled,
      undefined,
      'admin_001', // TODO: Get from auth context
    );
    return await this.commandBus.execute(command);
  }

  // ===== NOTIFICATION TEMPLATES =====

  @Get('notification-templates')
  @ApiOperation({ summary: 'Get notification templates' })
  @ApiResponse({
    status: 200,
    description: 'Notification templates retrieved successfully',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['email', 'sms', 'push'] })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getNotificationTemplates(
    @Query('type') type?: 'email' | 'sms' | 'push',
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const query = new GetNotificationTemplatesQuery(type, category, page, limit);
    return await this.queryBus.execute(query);
  }

  @Get('notification-templates/:id')
  @ApiOperation({ summary: 'Get single notification template' })
  @ApiResponse({
    status: 200,
    description: 'Notification template retrieved successfully',
  })
  async getNotificationTemplate(@Param('id') id: string) {
    const query = new GetNotificationTemplateQuery(id);
    return await this.queryBus.execute(query);
  }

  @Patch('notification-templates/:id')
  @ApiOperation({ summary: 'Update notification template' })
  @ApiResponse({
    status: 200,
    description: 'Notification template updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async updateNotificationTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    const command = new UpdateNotificationTemplateCommand(
      id,
      dto.subject,
      dto.bodyText,
      dto.bodyHtml,
      dto.isActive,
      'admin_001', // TODO: Get from auth context
    );
    return await this.commandBus.execute(command);
  }

  // ===== RATE LIMITS =====

  @Get('rate-limits')
  @ApiOperation({ summary: 'Get API rate limits' })
  @ApiResponse({ status: 200, description: 'Rate limits retrieved successfully' })
  async getRateLimits() {
    const query = new GetRateLimitsQuery();
    return await this.queryBus.execute(query);
  }

  @Patch('rate-limits')
  @ApiOperation({ summary: 'Update API rate limit' })
  @ApiResponse({ status: 200, description: 'Rate limit updated successfully' })
  @HttpCode(HttpStatus.OK)
  async updateRateLimit(@Body() dto: UpdateRateLimitDto) {
    const command = new UpdateRateLimitCommand(
      dto.resource,
      dto.method,
      dto.role,
      dto.limit,
      dto.window,
      'admin_001', // TODO: Get from auth context
    );
    return await this.commandBus.execute(command);
  }

  // ===== ADMIN ROLES =====

  @Get('admin-roles')
  @ApiOperation({ summary: 'Get all admin roles' })
  @ApiResponse({ status: 200, description: 'Admin roles retrieved successfully' })
  async getAdminRoles() {
    const query = new GetAdminRolesQuery();
    return await this.queryBus.execute(query);
  }

  @Post('admin-roles')
  @ApiOperation({ summary: 'Create new admin role' })
  @ApiResponse({ status: 201, description: 'Admin role created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createAdminRole(@Body() dto: CreateAdminRoleDto) {
    const command = new CreateAdminRoleCommand(
      dto.name,
      dto.slug,
      dto.description,
      dto.permissions,
      'admin_001', // TODO: Get from auth context
    );
    return await this.commandBus.execute(command);
  }

  @Patch('admin-roles/:id')
  @ApiOperation({ summary: 'Update admin role permissions' })
  @ApiResponse({ status: 200, description: 'Admin role updated successfully' })
  @HttpCode(HttpStatus.OK)
  async updateAdminRole(
    @Param('id') id: string,
    @Body() dto: UpdateAdminRoleDto,
  ) {
    const command = new UpdateAdminRoleCommand(
      id,
      dto.permissions,
      'admin_001', // TODO: Get from auth context
    );
    return await this.commandBus.execute(command);
  }

  // ===== ADMIN USERS =====

  @Get('admin-users')
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({ status: 200, description: 'Admin users retrieved successfully' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAdminUsers(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const query = new GetAdminUsersQuery(role, status, search, page, limit);
    return await this.queryBus.execute(query);
  }

  @Patch('admin-users/:id/role')
  @ApiOperation({ summary: 'Assign role to admin user' })
  @ApiResponse({
    status: 200,
    description: 'Admin user role updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async assignAdminRole(
    @Param('id') userId: string,
    @Body() dto: AssignAdminRoleDto,
  ) {
    const command = new AssignAdminRoleCommand(
      userId,
      dto.roleId,
      'admin_001', // TODO: Get from auth context
    );
    return await this.commandBus.execute(command);
  }

  // ===== AUDIT LOGS =====

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  @ApiQuery({ name: 'adminId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'dateFrom', required: false, type: Date })
  @ApiQuery({ name: 'dateTo', required: false, type: Date })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(
    @Query('adminId') adminId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const query = new GetAuditLogQuery(
      adminId,
      action,
      resource,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
      page,
      limit,
    );
    return await this.queryBus.execute(query);
  }

  @Get('audit-logs/stats')
  @ApiOperation({ summary: 'Get audit log statistics' })
  @ApiResponse({
    status: 200,
    description: 'Audit log statistics retrieved successfully',
  })
  async getAuditLogStats() {
    const query = new GetAuditLogStatsQuery();
    return await this.queryBus.execute(query);
  }

  // ===== EMAIL CONFIGURATION =====

  @Get('email-config')
  @ApiOperation({ summary: 'Get email configuration' })
  @ApiResponse({
    status: 200,
    description: 'Email configuration retrieved successfully',
  })
  async getEmailConfig() {
    const query = new GetEmailConfigQuery();
    return await this.queryBus.execute(query);
  }

  @Patch('email-config')
  @ApiOperation({ summary: 'Update email configuration' })
  @ApiResponse({
    status: 200,
    description: 'Email configuration updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async updateEmailConfig(@Body() dto: UpdateEmailConfigDto) {
    const command = new UpdateEmailConfigCommand(
      dto.provider,
      dto.isEnabled,
      dto.fromEmail,
      dto.fromName,
      dto.replyToEmail,
      dto.smtpHost,
      dto.smtpPort,
      dto.smtpSecure,
      dto.smtpUsername,
      dto.smtpPassword,
      dto.apiKey,
      'admin_001', // TODO: Get from auth context
    );
    return await this.commandBus.execute(command);
  }

  // ===== SMS CONFIGURATION =====

  @Get('sms-config')
  @ApiOperation({ summary: 'Get SMS configuration' })
  @ApiResponse({
    status: 200,
    description: 'SMS configuration retrieved successfully',
  })
  async getSMSConfig() {
    const query = new GetSMSConfigQuery();
    return await this.queryBus.execute(query);
  }

  @Patch('sms-config')
  @ApiOperation({ summary: 'Update SMS configuration' })
  @ApiResponse({
    status: 200,
    description: 'SMS configuration updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async updateSMSConfig(@Body() dto: UpdateSMSConfigDto) {
    const command = new UpdateSMSConfigCommand(
      dto.provider,
      dto.isEnabled,
      dto.senderName,
      dto.apiKey,
      dto.apiSecret,
      dto.twilioAccountSid,
      dto.twilioAuthToken,
      dto.twilioPhoneNumber,
      'admin_001', // TODO: Get from auth context
    );
    return await this.commandBus.execute(command);
  }

  // ===== SYSTEM HEALTH =====

  @Get('system-health')
  @AdminRoles('super_admin', 'admin', 'analyst') // Allow analysts to view health
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health retrieved successfully',
  })
  async getSystemHealth() {
    const query = new GetSystemHealthQuery();
    return await this.queryBus.execute(query);
  }
}
