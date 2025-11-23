import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserPaymentsQuery } from './get-user-payments.query';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../../domain/repositories/payment.repository.interface';

/**
 * Get User Payments Query Handler
 *
 * Handles the query to retrieve payment history for a user.
 */
@Injectable()
@QueryHandler(GetUserPaymentsQuery)
export class GetUserPaymentsHandler
  implements IQueryHandler<GetUserPaymentsQuery>
{
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(query: GetUserPaymentsQuery): Promise<any> {
    const { userId, status, limit, offset } = query;

    // 1. Get payments
    const result = await this.paymentRepository.findByUserId(
      userId,
      status,
      limit,
      offset,
    );

    // 2. Get user payment statistics
    const stats = await this.paymentRepository.getUserPaymentStats(userId);

    // 3. Map to response
    const items = result.items.map((payment) => ({
      id: payment.id,
      consultationId: payment.consultationId,
      subscriptionId: payment.subscriptionId,
      amount: payment.amount.amount,
      currency: payment.amount.currency,
      status: payment.status,
      method: payment.method,
      description: payment.description,
      refundedAmount: payment.refundedAmount?.amount,
      failureReason: payment.failureReason,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      canceledAt: payment.canceledAt,
      refundedAt: payment.refundedAt,
    }));

    return {
      items,
      total: result.total,
      limit,
      offset,
      hasMore: offset + items.length < result.total,
      // Statistics
      statistics: {
        totalPaid: stats.totalPaid,
        totalConsultations: stats.totalConsultations,
        averagePayment: stats.averagePayment,
        currency: stats.currency,
      },
    };
  }
}
