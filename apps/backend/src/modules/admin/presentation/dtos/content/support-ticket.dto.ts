import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SupportTicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_FOR_USER = 'waiting_for_user',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum SupportTicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum SupportTicketCategory {
  TECHNICAL = 'technical',
  PAYMENT = 'payment',
  ACCOUNT = 'account',
  CONSULTATION = 'consultation',
  LAWYER_ISSUE = 'lawyer_issue',
  REFUND = 'refund',
  OTHER = 'other',
}

export class GetSupportTicketsDto {
  @ApiPropertyOptional({ enum: SupportTicketStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(SupportTicketStatus)
  status?: SupportTicketStatus;

  @ApiPropertyOptional({ enum: SupportTicketPriority, description: 'Filter by priority' })
  @IsOptional()
  @IsEnum(SupportTicketPriority)
  priority?: SupportTicketPriority;

  @ApiPropertyOptional({ enum: SupportTicketCategory, description: 'Filter by category' })
  @IsOptional()
  @IsEnum(SupportTicketCategory)
  category?: SupportTicketCategory;

  @ApiPropertyOptional({ description: 'Filter by assigned admin ID' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  limit?: number = 20;
}

export class AssignSupportTicketDto {
  @ApiProperty({ description: 'Admin ID to assign ticket to' })
  @IsString()
  adminId: string;
}

export class ReplySupportTicketDto {
  @ApiProperty({ description: 'Reply message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Attachment URLs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class UpdateSupportTicketStatusDto {
  @ApiProperty({ enum: SupportTicketStatus, description: 'New status' })
  @IsEnum(SupportTicketStatus)
  status: SupportTicketStatus;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
