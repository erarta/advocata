import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { SendMessageCommand } from '../../application/commands/send-message/send-message.command';
import { MarkMessagesAsReadCommand } from '../../application/commands/mark-messages-as-read/mark-messages-as-read.command';
import { DeleteMessageCommand } from '../../application/commands/delete-message/delete-message.command';
import { GetMessagesQuery } from '../../application/queries/get-messages/get-messages.query';
import { GetUnreadCountQuery } from '../../application/queries/get-unread-count/get-unread-count.query';
import { SendMessageRequestDto } from '../dtos/send-message.request.dto';
import { MarkMessagesAsReadRequestDto } from '../dtos/mark-as-read.request.dto';
import {
  MessageResponseDto,
  PaginatedMessagesResponseDto,
} from '../dtos/message.response.dto';

/**
 * Message Controller
 *
 * REST API controller for message operations.
 * Handles sending, retrieving, and managing messages in consultations.
 */
@ApiTags('messages')
@Controller('api/v1/messages')
export class MessageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Send a new message
   *
   * POST /api/v1/messages
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a new message in a consultation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Message sent successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User is not a participant in this consultation',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid message data',
  })
  async sendMessage(
    @Body() dto: SendMessageRequestDto,
  ): Promise<MessageResponseDto> {
    const command = new SendMessageCommand(
      dto.consultationId,
      dto.senderId,
      dto.senderName,
      dto.content,
      dto.type,
      dto.senderAvatar,
    );

    return await this.commandBus.execute(command);
  }

  /**
   * Get messages for a consultation
   *
   * GET /api/v1/messages?consultationId=xxx&userId=xxx&limit=50&offset=0
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get messages for a consultation' })
  @ApiQuery({
    name: 'consultationId',
    required: true,
    description: 'Consultation ID',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User ID (for authorization)',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    description: 'Include soft-deleted messages',
    example: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of messages to return',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset for pagination',
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages retrieved successfully',
    type: PaginatedMessagesResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User is not a participant in this consultation',
  })
  async getMessages(
    @Query('consultationId') consultationId: string,
    @Query('userId') userId: string,
    @Query('includeDeleted') includeDeleted?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PaginatedMessagesResponseDto> {
    const query = new GetMessagesQuery(
      consultationId,
      userId,
      includeDeleted === true,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );

    return await this.queryBus.execute(query);
  }

  /**
   * Mark messages as read
   *
   * PUT /api/v1/messages/mark-as-read
   */
  @Put('mark-as-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all unread messages in a consultation as read',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages marked as read successfully',
    schema: {
      example: {
        consultationId: 'a0000000-0000-0000-0000-000000000001',
        messagesMarkedAsRead: 5,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User is not a participant in this consultation',
  })
  async markMessagesAsRead(
    @Body() dto: MarkMessagesAsReadRequestDto,
  ): Promise<any> {
    const command = new MarkMessagesAsReadCommand(
      dto.consultationId,
      dto.userId,
    );

    return await this.commandBus.execute(command);
  }

  /**
   * Get unread message count
   *
   * GET /api/v1/messages/unread-count?userId=xxx&consultationId=xxx
   */
  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get count of unread messages for a user' })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User ID',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @ApiQuery({
    name: 'consultationId',
    required: false,
    description: 'Consultation ID (optional, omit for total across all consultations)',
    example: 'a0000000-0000-0000-0000-000000000001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Unread count retrieved successfully',
    schema: {
      example: {
        userId: '11111111-1111-1111-1111-111111111111',
        consultationId: 'a0000000-0000-0000-0000-000000000001',
        unreadCount: 3,
      },
    },
  })
  async getUnreadCount(
    @Query('userId') userId: string,
    @Query('consultationId') consultationId?: string,
  ): Promise<any> {
    const query = new GetUnreadCountQuery(userId, consultationId);

    return await this.queryBus.execute(query);
  }

  /**
   * Delete a message
   *
   * DELETE /api/v1/messages/:id?userId=xxx
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a message (sender only)' })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: 'msg-0001-0000-0000-0000-000000000001',
  })
  @ApiQuery({
    name: 'userId',
    required: true,
    description: 'User ID (must be message sender)',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message deleted successfully',
    schema: {
      example: {
        id: 'msg-0001-0000-0000-0000-000000000001',
        deletedAt: '2025-01-18T14:30:22.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only sender can delete message',
  })
  async deleteMessage(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<any> {
    const command = new DeleteMessageCommand(id, userId);

    return await this.commandBus.execute(command);
  }
}
