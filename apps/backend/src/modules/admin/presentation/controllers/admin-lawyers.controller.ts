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

@ApiTags('admin/lawyers')
@Controller('admin/lawyers')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
@AdminRoles('admin', 'super_admin')
export class AdminLawyersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all lawyers with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Lawyers retrieved successfully' })
  async getLawyers(@Query() dto: any) {
    const { GetLawyersQuery } = await import(
      '../../application/queries/lawyers/get-lawyers'
    );
    return this.queryBus.execute(new GetLawyersQuery(dto));
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get lawyers pending verification' })
  @ApiResponse({ status: 200, description: 'Pending lawyers retrieved successfully' })
  async getPendingLawyers(@Query() dto: any) {
    const { GetPendingLawyersQuery } = await import(
      '../../application/queries/lawyers/get-pending-lawyers'
    );
    return this.queryBus.execute(new GetPendingLawyersQuery(dto));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lawyer statistics' })
  @ApiResponse({ status: 200, description: 'Lawyer stats retrieved successfully' })
  async getLawyerStats() {
    const { GetLawyerStatsQuery } = await import(
      '../../application/queries/lawyers/get-lawyer-stats'
    );
    return this.queryBus.execute(new GetLawyerStatsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lawyer details by ID' })
  @ApiResponse({ status: 200, description: 'Lawyer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lawyer not found' })
  async getLawyer(@Param('id') id: string) {
    const { GetLawyerQuery } = await import(
      '../../application/queries/lawyers/get-lawyer'
    );
    return this.queryBus.execute(new GetLawyerQuery(id));
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify lawyer credentials' })
  @ApiResponse({ status: 200, description: 'Lawyer verified successfully' })
  @HttpCode(HttpStatus.OK)
  async verifyLawyer(@Param('id') id: string, @Body() dto: any) {
    const { VerifyLawyerCommand } = await import(
      '../../application/commands/lawyers/verify-lawyer'
    );
    return this.commandBus.execute(new VerifyLawyerCommand(id, dto));
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject lawyer verification' })
  @ApiResponse({ status: 200, description: 'Lawyer verification rejected' })
  @HttpCode(HttpStatus.OK)
  async rejectLawyer(@Param('id') id: string, @Body() data: any) {
    // Rejection is handled by VerifyLawyerCommand with verified: false
    const { VerifyLawyerCommand } = await import(
      '../../application/commands/lawyers/verify-lawyer'
    );
    return this.commandBus.execute(
      new VerifyLawyerCommand(id, {
        verified: false,
        rejectionReason: data.reason,
        notes: data.notes,
      }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lawyer details' })
  @ApiResponse({ status: 200, description: 'Lawyer updated successfully' })
  async updateLawyer(@Param('id') id: string, @Body() dto: any) {
    const { UpdateLawyerCommand } = await import(
      '../../application/commands/lawyers/update-lawyer'
    );
    return this.commandBus.execute(new UpdateLawyerCommand(id, dto));
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend lawyer account' })
  @ApiResponse({ status: 200, description: 'Lawyer suspended successfully' })
  @HttpCode(HttpStatus.OK)
  async suspendLawyer(@Param('id') id: string, @Body() dto: any) {
    const { SuspendLawyerCommand } = await import(
      '../../application/commands/lawyers/suspend-lawyer'
    );
    return this.commandBus.execute(new SuspendLawyerCommand(id, dto));
  }

  @Post(':id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend lawyer account' })
  @ApiResponse({ status: 200, description: 'Lawyer unsuspended successfully' })
  @HttpCode(HttpStatus.OK)
  async unsuspendLawyer(@Param('id') id: string, @Body() dto?: any) {
    const { ActivateLawyerCommand } = await import(
      '../../application/commands/lawyers/activate-lawyer'
    );
    return this.commandBus.execute(new ActivateLawyerCommand(id, dto || {}));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lawyer account' })
  @ApiResponse({ status: 200, description: 'Lawyer deleted successfully' })
  @AdminRoles('super_admin')
  @HttpCode(HttpStatus.OK)
  async deleteLawyer(@Param('id') id: string) {
    const { DeleteLawyerCommand } = await import(
      '../../application/commands/lawyers/delete-lawyer'
    );
    return this.commandBus.execute(new DeleteLawyerCommand(id));
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get lawyer performance metrics' })
  @ApiResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getLawyerPerformance(@Param('id') id: string, @Query() dto: any) {
    const { GetLawyerPerformanceQuery } = await import(
      '../../application/queries/lawyers/get-lawyer-performance'
    );
    return this.queryBus.execute(new GetLawyerPerformanceQuery(dto));
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get lawyer reviews' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async getLawyerReviews(@Param('id') id: string, @Query() dto: any) {
    const { GetLawyerReviewsQuery } = await import(
      '../../application/queries/lawyers/get-lawyer-reviews'
    );
    return this.queryBus.execute(new GetLawyerReviewsQuery(id, dto));
  }
}
