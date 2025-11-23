import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPlatformBalanceQuery } from './get-platform-balance.query';
import { PaymentOrmEntity } from '../../../../../payment/infrastructure/persistence/payment.orm-entity';

interface PlatformBalance {
  balance: number;
  revenue: number;
  payouts: number;
  refunds: number;
  pendingPayouts: number;
  availableForPayout: number;
}

@QueryHandler(GetPlatformBalanceQuery)
export class GetPlatformBalanceHandler implements IQueryHandler<GetPlatformBalanceQuery> {
  private static readonly PLATFORM_COMMISSION = 0.10;

  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly paymentRepository: Repository<PaymentOrmEntity>,
  ) {}

  async execute(query: GetPlatformBalanceQuery): Promise<PlatformBalance> {
    // Get all succeeded payments
    const succeededPayments = await this.paymentRepository.find({
      where: { status: 'succeeded' },
    });

    // Calculate total revenue
    const totalRevenue = succeededPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Calculate platform commission (revenue)
    const platformRevenue = totalRevenue * GetPlatformBalanceHandler.PLATFORM_COMMISSION;

    // Calculate total refunds
    const refundedPayments = await this.paymentRepository.find({
      where: { status: 'refunded' },
    });

    const totalRefunds = refundedPayments.reduce(
      (sum, p) => sum + Number(p.refundedAmount || p.amount),
      0,
    );

    // TODO: Calculate actual payouts when payout table exists
    const completedPayouts = 0; // No payout tracking yet

    // Calculate lawyer earnings (pending payouts)
    const lawyerEarnings = totalRevenue - platformRevenue;

    // Calculate platform balance
    const balance = platformRevenue - completedPayouts - totalRefunds;

    // Available for payout (revenue - already paid - pending payouts)
    const availableForPayout = platformRevenue - completedPayouts - lawyerEarnings;

    return {
      balance,
      revenue: platformRevenue,
      payouts: completedPayouts,
      refunds: totalRefunds,
      pendingPayouts: lawyerEarnings,
      availableForPayout: Math.max(0, availableForPayout),
    };
  }
}
