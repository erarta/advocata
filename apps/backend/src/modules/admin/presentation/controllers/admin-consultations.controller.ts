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

// Import DTOs
import { GetConsultationsDto } from '../dtos/consultations/get-consultations.dto';
import { UpdateConsultationStatusDto } from '../dtos/consultations/update-consultation-status.dto';

// Import Queries
import { GetConsultationsQuery } from '../../application/queries/consultations/get-consultations';
import { GetLiveConsultationsQuery } from '../../application/queries/consultations/get-live-consultations';
import { GetConsultationQuery } from '../../application/queries/consultations/get-consultation';
import { GetConsultationMessagesQuery } from '../../application/queries/consultations/get-consultation-messages';
import { GetDisputesQuery } from '../../application/queries/consultations/get-disputes';
import { GetEmergencyCallsQuery } from '../../application/queries/consultations/get-emergency-calls';
import { GetConsultationStatsQuery } from '../../application/queries/consultations/get-consultation-stats';

// Import Commands
import { UpdateConsultationStatusCommand } from '../../application/commands/consultations/update-consultation-status';
import { IssueRefundCommand } from '../../application/commands/consultations/issue-refund';
import { ResolveDisputeCommand } from '../../application/commands/consultations/resolve-dispute';

@ApiTags('admin/consultations')
@Controller('admin/consultations')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
@AdminRoles('admin', 'super_admin', 'support')
export class AdminConsultationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all consultations with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Consultations retrieved successfully' })
  async getConsultations(@Query() dto: GetConsultationsDto) {
    return this.queryBus.execute(new GetConsultationsQuery(dto));
  }

  @Get('live')
  @ApiOperation({ summary: 'Get consultations currently in progress' })
  @ApiResponse({ status: 200, description: 'Live consultations retrieved successfully' })
  async getLiveConsultations() {
    return this.queryBus.execute(new GetLiveConsultationsQuery());
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get consultation statistics' })
  @ApiResponse({ status: 200, description: 'Consultation stats retrieved successfully' })
  async getConsultationStats(@Query() dto: any) {
    return this.queryBus.execute(new GetConsultationStatsQuery(dto));
  }

  @Get('disputes')
  @ApiOperation({ summary: 'Get consultations with disputes' })
  @ApiResponse({ status: 200, description: 'Disputed consultations retrieved successfully' })
  async getDisputes(@Query() dto: any) {
    return this.queryBus.execute(new GetDisputesQuery(dto));
  }

  @Get('emergency')
  @ApiOperation({ summary: 'Get emergency consultation requests' })
  @ApiResponse({ status: 200, description: 'Emergency calls retrieved successfully' })
  async getEmergencyCalls(@Query() dto: any) {
    return this.queryBus.execute(new GetEmergencyCallsQuery(dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultation details by ID' })
  @ApiResponse({ status: 200, description: 'Consultation retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Consultation not found' })
  async getConsultation(@Param('id') id: string) {
    return this.queryBus.execute(new GetConsultationQuery(id));
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get consultation messages' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async getConsultationMessages(@Param('id') id: string, @Query() dto: any) {
    return this.queryBus.execute(new GetConsultationMessagesQuery(id, dto));
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update consultation status' })
  @ApiResponse({ status: 200, description: 'Consultation status updated successfully' })
  async updateConsultationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateConsultationStatusDto,
  ) {
    return this.commandBus.execute(new UpdateConsultationStatusCommand(id, dto));
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Issue refund for consultation' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @AdminRoles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async issueRefund(@Param('id') id: string, @Body() dto: any) {
    return this.commandBus.execute(new IssueRefundCommand(id, dto));
  }

  @Post(':id/resolve-dispute')
  @ApiOperation({ summary: 'Resolve consultation dispute' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  @AdminRoles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async resolveDispute(@Param('id') id: string, @Body() dto: any) {
    return this.commandBus.execute(new ResolveDisputeCommand(id, dto));
  }
}
