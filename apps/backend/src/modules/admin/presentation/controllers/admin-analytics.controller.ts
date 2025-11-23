import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../infrastructure/guards/admin-auth.guard';
import { AdminRoles } from '../../infrastructure/decorators/admin-roles.decorator';
import {
  DashboardMetricsDto,
  RevenueMetricsDto,
  UserGrowthDto,
  LawyerPerformanceDto,
  PlatformAnalyticsDto,
  GeographicAnalyticsDto,
  SpecializationAnalyticsDto,
} from '../dtos/analytics';
import { GetDashboardMetricsQuery } from '../../application/queries/analytics/get-dashboard-metrics';
import { GetRevenueAnalyticsQuery } from '../../application/queries/analytics/get-revenue-analytics';
import { GetUserGrowthQuery } from '../../application/queries/analytics/get-user-growth';
import { GetLawyerPerformanceAnalyticsQuery } from '../../application/queries/analytics/get-lawyer-performance-analytics';
import { GetPlatformAnalyticsQuery } from '../../application/queries/analytics/get-platform-analytics';
import { GetRevenueMetricsQuery } from '../../application/queries/analytics/get-revenue-metrics';
import { GetUserGrowthMetricsQuery } from '../../application/queries/analytics/get-user-growth-metrics';
import { GetGeographicAnalyticsQuery } from '../../application/queries/analytics/get-geographic-analytics';
import { GetSpecializationAnalyticsQuery } from '../../application/queries/analytics/get-specialization-analytics';

@ApiTags('admin/analytics')
@Controller('admin/analytics')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
@AdminRoles('admin', 'super_admin', 'analyst')
export class AdminAnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics retrieved successfully' })
  async getDashboardMetrics(@Query() dto: DashboardMetricsDto) {
    return this.queryBus.execute(new GetDashboardMetricsQuery(dto));
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  async getRevenueAnalytics(@Query() dto: RevenueMetricsDto) {
    return this.queryBus.execute(new GetRevenueAnalyticsQuery(dto));
  }

  @Get('users/growth')
  @ApiOperation({ summary: 'Get user growth analytics' })
  @ApiResponse({ status: 200, description: 'User growth analytics retrieved successfully' })
  async getUserGrowth(@Query() dto: UserGrowthDto) {
    return this.queryBus.execute(new GetUserGrowthQuery(dto));
  }

  @Get('lawyers/performance')
  @ApiOperation({ summary: 'Get lawyer performance analytics' })
  @ApiResponse({ status: 200, description: 'Lawyer performance analytics retrieved successfully' })
  async getLawyerPerformance(@Query() dto: LawyerPerformanceDto) {
    return this.queryBus.execute(new GetLawyerPerformanceAnalyticsQuery(dto));
  }

  @Get('platform')
  @ApiOperation({ summary: 'Get platform analytics' })
  @ApiResponse({ status: 200, description: 'Platform analytics retrieved successfully' })
  async getPlatformAnalytics(@Query() dto: PlatformAnalyticsDto) {
    return this.queryBus.execute(new GetPlatformAnalyticsQuery(dto));
  }

  @Get('revenue/metrics')
  @ApiOperation({ summary: 'Get revenue metrics' })
  @ApiResponse({ status: 200, description: 'Revenue metrics retrieved successfully' })
  async getRevenueMetrics(@Query() dto: RevenueMetricsDto) {
    return this.queryBus.execute(new GetRevenueMetricsQuery(dto));
  }

  @Get('users/metrics')
  @ApiOperation({ summary: 'Get user growth metrics' })
  @ApiResponse({ status: 200, description: 'User growth metrics retrieved successfully' })
  async getUserMetrics(@Query() dto: UserGrowthDto) {
    return this.queryBus.execute(new GetUserGrowthMetricsQuery(dto));
  }

  @Get('geography')
  @ApiOperation({ summary: 'Get geographic analytics' })
  @ApiResponse({ status: 200, description: 'Geographic analytics retrieved successfully' })
  async getGeographicAnalytics(@Query() dto: GeographicAnalyticsDto) {
    return this.queryBus.execute(new GetGeographicAnalyticsQuery(dto));
  }

  @Get('specializations')
  @ApiOperation({ summary: 'Get specialization analytics' })
  @ApiResponse({ status: 200, description: 'Specialization analytics retrieved successfully' })
  async getSpecializationAnalytics(@Query() dto: SpecializationAnalyticsDto) {
    return this.queryBus.execute(new GetSpecializationAnalyticsQuery(dto));
  }
}
