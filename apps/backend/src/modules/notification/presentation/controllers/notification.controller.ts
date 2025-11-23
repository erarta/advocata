import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { SendEmailDto } from '../dtos/send-email.dto';
import { SendSmsDto } from '../dtos/send-sms.dto';
import { SendPushDto } from '../dtos/send-push.dto';
import { NotificationResponseDto } from '../dtos/notification.response.dto';
import { SendEmailCommand } from '../../application/commands/send-email/send-email.command';
import { SendSmsCommand } from '../../application/commands/send-sms/send-sms.command';
import { SendPushCommand } from '../../application/commands/send-push/send-push.command';
import { GetNotificationQuery } from '../../application/queries/get-notification/get-notification.query';
import { GetUserNotificationsQuery } from '../../application/queries/get-user-notifications/get-user-notifications.query';

/**
 * Notification Controller
 *
 * REST API endpoints for managing notifications
 */
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Send email notification
   */
  @Post('email')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendEmail(@Request() req: any, @Body() dto: SendEmailDto) {
    const userId = req.user?.id || 'system';

    const command = new SendEmailCommand(
      userId,
      dto.to,
      dto.subject,
      dto.body,
      dto.html,
      dto.templateId,
      dto.templateData,
      dto.metadata,
    );

    const result = await this.commandBus.execute(command);

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return {
      success: true,
      jobId: result.getValue(),
      message: 'Email queued for sending',
    };
  }

  /**
   * Send SMS notification
   */
  @Post('sms')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendSms(@Request() req: any, @Body() dto: SendSmsDto) {
    const userId = req.user?.id || 'system';

    const command = new SendSmsCommand(userId, dto.to, dto.message, dto.metadata);

    const result = await this.commandBus.execute(command);

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return {
      success: true,
      jobId: result.getValue(),
      message: 'SMS queued for sending',
    };
  }

  /**
   * Send push notification
   */
  @Post('push')
  @HttpCode(HttpStatus.ACCEPTED)
  async sendPush(@Request() req: any, @Body() dto: SendPushDto) {
    const userId = req.user?.id || 'system';

    const command = new SendPushCommand(
      userId,
      dto.deviceToken,
      dto.title,
      dto.body,
      dto.data,
      dto.metadata,
    );

    const result = await this.commandBus.execute(command);

    if (result.isFailure) {
      throw new Error(result.error);
    }

    return {
      success: true,
      jobId: result.getValue(),
      message: 'Push notification queued for sending',
    };
  }

  /**
   * Get notification by ID
   */
  @Get(':id')
  async getNotification(@Param('id') id: string) {
    const notification = await this.queryBus.execute(new GetNotificationQuery(id));

    return NotificationResponseDto.fromDomain(notification);
  }

  /**
   * Get user notifications
   */
  @Get()
  async getUserNotifications(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = req.user?.id || 'system';

    const notifications = await this.queryBus.execute(
      new GetUserNotificationsQuery(userId, limit ? parseInt(limit.toString()) : 50, offset ? parseInt(offset.toString()) : 0),
    );

    return {
      items: notifications.map((n) => NotificationResponseDto.fromDomain(n)),
      total: notifications.length,
      limit: limit || 50,
      offset: offset || 0,
    };
  }
}
