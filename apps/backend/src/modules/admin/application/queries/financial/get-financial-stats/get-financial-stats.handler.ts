import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { GetFinancialStatsQuery } from './get-financial-stats.query';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';

interface FinancialStats {
  revenue: {
    total: number;
    consultations: number;
    subscriptions: number;
    commission: number;
  };
  payouts: {
    pending: number;
    completed: number;
    failed: number;
  };
  refunds: {
    pending: number;
    approved: number;
    processed: number;
    total: number;
  };
  transactions: {
    total: number;
    successful: number;
    failed: number;
  };
  platformBalance: number;
}

@QueryHandler(GetFinancialStatsQuery)
export class GetFinancialStatsHandler implements IQueryHandler<GetFinancialStatsQuery> {
  private static readonly PLATFORM_COMMISSION = 0.10;

  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
  ) {}

  async execute(query: GetFinancialStatsQuery): Promise<FinancialStats> {
    const { dateFrom, dateTo } = query.dto;

    // Build date filter
    const dateFilter: any = {};
    if (dateFrom && dateTo) {
      dateFilter.createdAt = Between(new Date(dateFrom), new Date(dateTo));
    } else if (dateFrom) {
      dateFilter.createdAt = Between(new Date(dateFrom), new Date());
    }

    // Get all payments in date range
    const allPayments = await this.paymentRepository.find({
      where: dateFilter,
    });

    // Calculate revenue statistics
    const succeededPayments = allPayments.filter((p) => p.status === 'succeeded');
    const consultationPayments = succeededPayments.filter((p) => p.consultationId);
    const subscriptionPayments = succeededPayments.filter((p) => p.subscriptionId);

    const totalRevenue = succeededPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const consultationRevenue = consultationPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const subscriptionRevenue = subscriptionPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const commissionRevenue = totalRevenue * GetFinancialStatsHandler.PLATFORM_COMMISSION;

    // Calculate refund statistics
    const refundedPayments = allPayments.filter(
      (p) => p.status === 'refunded' || p.refundedAmount,
    );
    const totalRefunds = refundedPayments.reduce(
      (sum, p) => sum + Number(p.refundedAmount || 0),
      0,
    );

    // Calculate transaction statistics
    const totalTransactions = allPayments.length;
    const successfulTransactions = succeededPayments.length;
    const failedTransactions = allPayments.filter((p) => p.status === 'failed').length;

    // Calculate payout statistics (TODO: will be accurate when payout table exists)
    const lawyerEarnings = totalRevenue - commissionRevenue;
    const pendingPayouts = lawyerEarnings; // All earnings are pending until paid
    const completedPayouts = 0; // No payout tracking yet
    const failedPayouts = 0;

    // Calculate platform balance
    const platformBalance = commissionRevenue - completedPayouts - totalRefunds;

    return {
      revenue: {
        total: totalRevenue,
        consultations: consultationRevenue,
        subscriptions: subscriptionRevenue,
        commission: commissionRevenue,
      },
      payouts: {
        pending: pendingPayouts,
        completed: completedPayouts,
        failed: failedPayouts,
      },
      refunds: {
        pending: 0, // TODO: Track pending refund requests
        approved: refundedPayments.length,
        processed: refundedPayments.filter((p) => p.status === 'refunded').length,
        total: totalRefunds,
      },
      transactions: {
        total: totalTransactions,
        successful: successfulTransactions,
        failed: failedTransactions,
      },
      platformBalance,
    };
  }
}
