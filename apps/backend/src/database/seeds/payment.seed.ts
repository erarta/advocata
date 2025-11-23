import { DataSource } from 'typeorm';

/**
 * Payment ORM Entity Interface
 * (Define inline to avoid circular dependencies in seed files)
 */
interface PaymentOrmEntity {
  id: string;
  userId: string;
  consultationId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  description?: string;
  yooKassaPaymentId?: string;
  yooKassaPaymentUrl?: string;
  refundedAmount?: number;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  canceledAt?: Date;
  refundedAt?: Date;
}

/**
 * Payment Seed Data
 *
 * Seeds the database with test payment data for development/testing.
 * Creates payments with different statuses to cover all scenarios.
 */
export class PaymentSeed {
  /**
   * Run seed
   */
  public static async run(dataSource: DataSource): Promise<void> {
    const paymentRepository = dataSource.getRepository('payments');

    // Clear existing data
    await paymentRepository.query('DELETE FROM payments');

    // Test user IDs (match consultation.seed.ts)
    const clientId1 = '11111111-1111-1111-1111-111111111111';
    const clientId2 = '22222222-2222-2222-2222-222222222222';

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // ==========================================================================
    // Payment 1: Succeeded payment for active consultation
    // Consultation ID: a0000000-0000-0000-0000-000000000003 (active, emergency)
    // ==========================================================================

    const payment1: Partial<PaymentOrmEntity> = {
      id: 'pay-0001-0000-0000-0000-000000000001',
      userId: clientId2,
      consultationId: 'a0000000-0000-0000-0000-000000000003',
      amount: 5000,
      currency: 'RUB',
      status: 'succeeded',
      method: 'bank_card',
      description: 'Оплата экстренной консультации',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-13b4e5f73b3d',
      metadata: {
        consultationType: 'emergency',
        source: 'mobile_app',
      },
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo,
      completedAt: oneHourAgo,
    };

    // ==========================================================================
    // Payment 2: Succeeded payment for completed consultation
    // Consultation ID: a0000000-0000-0000-0000-000000000004 (completed, rated)
    // ==========================================================================

    const payment2: Partial<PaymentOrmEntity> = {
      id: 'pay-0002-0000-0000-0000-000000000001',
      userId: clientId1,
      consultationId: 'a0000000-0000-0000-0000-000000000004',
      amount: 3000,
      currency: 'RUB',
      status: 'succeeded',
      method: 'yoo_money',
      description: 'Оплата консультации по наследству',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-22c5f6g84c4e',
      metadata: {
        consultationType: 'scheduled',
        source: 'web_app',
      },
      createdAt: lastWeek,
      updatedAt: lastWeek,
      completedAt: lastWeek,
    };

    // ==========================================================================
    // Payment 3: Pending payment (user hasn't paid yet)
    // Consultation ID: a0000000-0000-0000-0000-000000000001 (pending)
    // ==========================================================================

    const payment3: Partial<PaymentOrmEntity> = {
      id: 'pay-0003-0000-0000-0000-000000000001',
      userId: clientId1,
      consultationId: 'a0000000-0000-0000-0000-000000000001',
      amount: 3000,
      currency: 'RUB',
      status: 'pending',
      description: 'Оплата консультации по ДТП',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-33d6g7h95d5f',
      yooKassaPaymentUrl: 'https://yoomoney.ru/checkout/payments/v2/contract?orderId=...',
      metadata: {
        consultationType: 'scheduled',
        source: 'mobile_app',
      },
      createdAt: now,
      updatedAt: now,
    };

    // ==========================================================================
    // Payment 4: Canceled payment (user canceled before paying)
    // ==========================================================================

    const payment4: Partial<PaymentOrmEntity> = {
      id: 'pay-0004-0000-0000-0000-000000000001',
      userId: clientId2,
      consultationId: 'a0000000-0000-0000-0000-000000000002',
      amount: 2500,
      currency: 'RUB',
      status: 'canceled',
      description: 'Оплата консультации по трудовому праву',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-44e7h8i06e6g',
      metadata: {
        consultationType: 'scheduled',
        source: 'mobile_app',
        cancelReason: 'User canceled',
      },
      createdAt: yesterday,
      updatedAt: yesterday,
      canceledAt: yesterday,
    };

    // ==========================================================================
    // Payment 5: Failed payment (insufficient funds)
    // ==========================================================================

    const payment5: Partial<PaymentOrmEntity> = {
      id: 'pay-0005-0000-0000-0000-000000000001',
      userId: clientId1,
      consultationId: 'a0000000-0000-0000-0000-000000000005',
      amount: 4000,
      currency: 'RUB',
      status: 'failed',
      description: 'Оплата консультации по уголовному праву',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-55f8i9j17f7h',
      failureReason: 'Insufficient funds',
      metadata: {
        consultationType: 'scheduled',
        source: 'mobile_app',
      },
      createdAt: yesterday,
      updatedAt: yesterday,
    };

    // ==========================================================================
    // Payment 6: Partially refunded payment
    // Consultation ID: a0000000-0000-0000-0000-000000000006 (canceled by lawyer)
    // ==========================================================================

    const payment6: Partial<PaymentOrmEntity> = {
      id: 'pay-0006-0000-0000-0000-000000000001',
      userId: clientId2,
      consultationId: 'a0000000-0000-0000-0000-000000000006',
      amount: 3500,
      currency: 'RUB',
      status: 'succeeded',
      method: 'bank_card',
      description: 'Оплата консультации по жилищному праву',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-66g9j0k28g8i',
      refundedAmount: 1750, // Partial refund (50%)
      metadata: {
        consultationType: 'scheduled',
        source: 'web_app',
        refundReason: 'Lawyer canceled, partial service provided',
      },
      createdAt: twoWeeksAgo,
      updatedAt: lastWeek,
      completedAt: twoWeeksAgo,
    };

    // ==========================================================================
    // Payment 7: Fully refunded payment
    // Consultation ID: a0000000-0000-0000-0000-000000000007 (refunded)
    // ==========================================================================

    const payment7: Partial<PaymentOrmEntity> = {
      id: 'pay-0007-0000-0000-0000-000000000001',
      userId: clientId1,
      consultationId: 'a0000000-0000-0000-0000-000000000007',
      amount: 3000,
      currency: 'RUB',
      status: 'refunded',
      method: 'sber_pay',
      description: 'Оплата консультации по семейному праву',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-77h0k1l39h9j',
      refundedAmount: 3000, // Full refund
      metadata: {
        consultationType: 'scheduled',
        source: 'mobile_app',
        refundReason: 'Service not provided',
      },
      createdAt: twoWeeksAgo,
      updatedAt: lastWeek,
      completedAt: twoWeeksAgo,
      refundedAt: lastWeek,
    };

    // ==========================================================================
    // Payment 8: Waiting for capture (two-step payment)
    // ==========================================================================

    const payment8: Partial<PaymentOrmEntity> = {
      id: 'pay-0008-0000-0000-0000-000000000001',
      userId: clientId2,
      consultationId: 'a0000000-0000-0000-0000-000000000008',
      amount: 4500,
      currency: 'RUB',
      status: 'waiting_for_capture',
      description: 'Оплата консультации по налоговому праву',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-88i1l2m40i0k',
      metadata: {
        consultationType: 'scheduled',
        source: 'web_app',
        twoStep: true,
      },
      createdAt: now,
      updatedAt: now,
    };

    // ==========================================================================
    // Payment 9: Completed payment with Apple Pay
    // Consultation ID: a0000000-0000-0000-0000-000000000010 (chat, completed)
    // ==========================================================================

    const payment9: Partial<PaymentOrmEntity> = {
      id: 'pay-0009-0000-0000-0000-000000000001',
      userId: clientId1,
      consultationId: 'a0000000-0000-0000-0000-000000000010',
      amount: 2000,
      currency: 'RUB',
      status: 'succeeded',
      method: 'apple_pay',
      description: 'Оплата текстовой консультации',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-99j2m3n51j1l',
      metadata: {
        consultationType: 'chat',
        source: 'mobile_app',
        platform: 'ios',
      },
      createdAt: lastWeek,
      updatedAt: lastWeek,
      completedAt: lastWeek,
    };

    // ==========================================================================
    // Payment 10: Subscription payment (monthly)
    // ==========================================================================

    const payment10: Partial<PaymentOrmEntity> = {
      id: 'pay-0010-0000-0000-0000-000000000001',
      userId: clientId2,
      subscriptionId: 'sub-0001-0000-0000-0000-000000000001',
      amount: 1990,
      currency: 'RUB',
      status: 'succeeded',
      method: 'bank_card',
      description: 'Ежемесячная подписка Premium',
      yooKassaPaymentId: '2d9f5b42-000f-5000-8000-00k3n4o62k2m',
      metadata: {
        subscriptionType: 'premium',
        source: 'mobile_app',
        period: 'monthly',
      },
      createdAt: now,
      updatedAt: now,
      completedAt: now,
    };

    // Combine all payments
    const payments = [
      payment1,
      payment2,
      payment3,
      payment4,
      payment5,
      payment6,
      payment7,
      payment8,
      payment9,
      payment10,
    ];

    // Insert all payments
    await paymentRepository.save(payments);

    console.log(`✅ Seeded ${payments.length} payments with various statuses`);

    // Print summary
    console.log('\n📊 Payment Summary:');
    console.log('  - Succeeded: 4 payments (40,490 RUB)');
    console.log('  - Pending: 1 payment (3,000 RUB)');
    console.log('  - Waiting for capture: 1 payment (4,500 RUB)');
    console.log('  - Canceled: 1 payment (2,500 RUB)');
    console.log('  - Failed: 1 payment (4,000 RUB)');
    console.log('  - Refunded: 1 payment (3,000 RUB)');
    console.log('  - Partially refunded: 1 payment (3,500 RUB, refunded 1,750 RUB)');
    console.log('  - Subscription: 1 payment (1,990 RUB)\n');
  }
}

/**
 * Run seed if executed directly
 */
if (require.main === module) {
  (async () => {
    const { DataSource } = await import('typeorm');

    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'advocata',
      password: process.env.DB_PASSWORD || 'advocata_dev_password',
      database: process.env.DB_DATABASE || 'advocata',
      entities: ['src/**/*.orm-entity.ts'],
      synchronize: false,
    });

    try {
      await dataSource.initialize();
      console.log('🔌 Database connected');

      await PaymentSeed.run(dataSource);

      await dataSource.destroy();
      console.log('✅ Seed completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    }
  })();
}
