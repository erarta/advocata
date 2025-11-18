import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPaymentQuery } from './get-payment.query';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '../../../domain/repositories/payment.repository.interface';

/**
 * Get Payment Query Handler
 *
 * Handles the query to retrieve a payment by ID.
 */
@Injectable()
@QueryHandler(GetPaymentQuery)
export class GetPaymentHandler implements IQueryHandler<GetPaymentQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(query: GetPaymentQuery): Promise<any> {
    const { paymentId, userId } = query;

    // 1. Find payment
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // 2. Authorization check (if userId provided)
    if (userId && payment.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this payment',
      );
    }

    // 3. Return payment details
    return {
      id: payment.id,
      userId: payment.userId,
      consultationId: payment.consultationId,
      subscriptionId: payment.subscriptionId,
      amount: payment.amount.amount,
      currency: payment.amount.currency,
      status: payment.status,
      method: payment.method,
      description: payment.description,
      yooKassaPaymentId: payment.yooKassaPaymentId,
      refundedAmount: payment.refundedAmount?.amount,
      failureReason: payment.failureReason,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      completedAt: payment.completedAt,
      canceledAt: payment.canceledAt,
      refundedAt: payment.refundedAt,
      // Calculated fields
      lawyerPayout: payment.isCompleted
        ? payment.lawyerPayout.amount
        : undefined,
      platformCommission: payment.isCompleted
        ? payment.platformCommission.amount
        : undefined,
    };
  }
}
