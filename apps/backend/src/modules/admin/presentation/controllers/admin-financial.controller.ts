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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../infrastructure/guards/admin-auth.guard';
import { AdminRoles } from '../../infrastructure/decorators/admin-roles.decorator';

@ApiTags('admin/financial')
@Controller('admin/financial')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
@AdminRoles('admin', 'super_admin')
export class AdminFinancialController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions with filters' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(@Query() query: any) {
    const { GetTransactionsQuery } = await import('../../application/queries/financial/get-transactions');
    return this.queryBus.execute(new GetTransactionsQuery(query));
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('id') id: string) {
    // TODO: Implement GetTransactionQuery
    return {
      id,
      amount: 0,
      status: 'completed',
      type: 'payment',
    };
  }

  @Get('payouts')
  @ApiOperation({ summary: 'Get lawyer payouts' })
  @ApiResponse({ status: 200, description: 'Payouts retrieved successfully' })
  async getPayouts(@Query() query: any) {
    const { GetPayoutsQuery } = await import('../../application/queries/financial/get-payouts');
    return this.queryBus.execute(new GetPayoutsQuery(query));
  }

  @Get('payouts/pending')
  @ApiOperation({ summary: 'Get pending payouts' })
  @ApiResponse({ status: 200, description: 'Pending payouts retrieved successfully' })
  async getPendingPayouts(@Query() query: any) {
    const { GetPayoutsQuery } = await import('../../application/queries/financial/get-payouts');
    return this.queryBus.execute(new GetPayoutsQuery({ ...query, status: 'pending' }));
  }

  @Post('payouts/:id/process')
  @ApiOperation({ summary: 'Process payout to lawyer' })
  @ApiResponse({ status: 200, description: 'Payout processed successfully' })
  @HttpCode(HttpStatus.OK)
  @AdminRoles('super_admin')
  async processPayout(@Param('id') id: string, @Body() data: any) {
    const { ProcessPayoutCommand } = await import('../../application/commands/financial/process-payout');
    return this.commandBus.execute(new ProcessPayoutCommand(id, data));
  }

  @Post('payouts/batch-process')
  @ApiOperation({ summary: 'Process multiple payouts in batch' })
  @ApiResponse({ status: 200, description: 'Batch payouts processed successfully' })
  @HttpCode(HttpStatus.OK)
  @AdminRoles('super_admin')
  async batchProcessPayouts(@Body() data: any) {
    const { ProcessBulkPayoutsCommand } = await import('../../application/commands/financial/process-bulk-payouts');
    return this.commandBus.execute(new ProcessBulkPayoutsCommand(data.payouts));
  }

  @Get('refunds')
  @ApiOperation({ summary: 'Get all refunds' })
  @ApiResponse({ status: 200, description: 'Refunds retrieved successfully' })
  async getRefunds(@Query() query: any) {
    const { GetRefundsQuery } = await import('../../application/queries/financial/get-refunds');
    return this.queryBus.execute(new GetRefundsQuery(query));
  }

  @Get('refunds/pending')
  @ApiOperation({ summary: 'Get pending refund requests' })
  @ApiResponse({ status: 200, description: 'Pending refunds retrieved successfully' })
  async getPendingRefunds(@Query() query: any) {
    const { GetRefundsQuery } = await import('../../application/queries/financial/get-refunds');
    return this.queryBus.execute(new GetRefundsQuery({ ...query, status: 'pending' }));
  }

  @Post('refunds/:id/approve')
  @ApiOperation({ summary: 'Approve refund request' })
  @ApiResponse({ status: 200, description: 'Refund approved successfully' })
  @HttpCode(HttpStatus.OK)
  async approveRefund(@Param('id') id: string, @Body() data: any) {
    const { ApproveRefundCommand } = await import('../../application/commands/financial/approve-refund');
    return this.commandBus.execute(new ApproveRefundCommand(id, data));
  }

  @Post('refunds/:id/reject')
  @ApiOperation({ summary: 'Reject refund request' })
  @ApiResponse({ status: 200, description: 'Refund rejected successfully' })
  @HttpCode(HttpStatus.OK)
  async rejectRefund(@Param('id') id: string, @Body() data: any) {
    const { RejectRefundCommand } = await import('../../application/commands/financial/reject-refund');
    return this.commandBus.execute(new RejectRefundCommand(id, data));
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Get all subscriptions' })
  @ApiResponse({ status: 200, description: 'Subscriptions retrieved successfully' })
  async getSubscriptions(@Query() query: any) {
    const { GetSubscriptionsQuery } = await import('../../application/queries/financial/get-subscriptions');
    return this.queryBus.execute(new GetSubscriptionsQuery(query));
  }

  @Patch('subscriptions/:id')
  @ApiOperation({ summary: 'Update subscription status' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  async updateSubscription(@Param('id') id: string, @Body() data: any) {
    const { UpdateSubscriptionCommand } = await import('../../application/commands/financial/update-subscription');
    return this.commandBus.execute(new UpdateSubscriptionCommand(id, data));
  }

  @Get('revenue-reports')
  @ApiOperation({ summary: 'Generate revenue report' })
  @ApiResponse({ status: 200, description: 'Revenue report generated successfully' })
  async getRevenueReport(@Query() query: any) {
    const { GetFinancialStatsQuery } = await import('../../application/queries/financial/get-financial-stats');
    return this.queryBus.execute(new GetFinancialStatsQuery({ dateFrom: query.startDate, dateTo: query.endDate }));
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Get payment method statistics' })
  @ApiResponse({ status: 200, description: 'Payment method stats retrieved successfully' })
  async getPaymentMethodStats() {
    // TODO: Implement GetPaymentMethodStatsQuery
    return {
      methods: [],
      mostUsed: '',
      successRates: {},
    };
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Get commission configuration' })
  @ApiResponse({ status: 200, description: 'Commission configuration retrieved successfully' })
  async getCommissions() {
    const { GetCommissionsQuery } = await import('../../application/queries/financial/get-commissions');
    return this.queryBus.execute(new GetCommissionsQuery());
  }

  @Patch('commissions')
  @ApiOperation({ summary: 'Update commission configuration' })
  @ApiResponse({ status: 200, description: 'Commission configuration updated successfully' })
  @AdminRoles('super_admin')
  async updateCommissions(@Body() data: any) {
    const { UpdateCommissionsCommand } = await import('../../application/commands/financial/update-commissions');
    return this.commandBus.execute(new UpdateCommissionsCommand(data));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get financial statistics' })
  @ApiResponse({ status: 200, description: 'Financial statistics retrieved successfully' })
  async getFinancialStats(@Query() query: any) {
    const { GetFinancialStatsQuery } = await import('../../application/queries/financial/get-financial-stats');
    return this.queryBus.execute(new GetFinancialStatsQuery(query));
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get platform balance' })
  @ApiResponse({ status: 200, description: 'Platform balance retrieved successfully' })
  async getPlatformBalance() {
    const { GetPlatformBalanceQuery } = await import('../../application/queries/financial/get-platform-balance');
    return this.queryBus.execute(new GetPlatformBalanceQuery());
  }
}
