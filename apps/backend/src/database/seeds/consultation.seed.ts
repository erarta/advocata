import { DataSource } from 'typeorm';
import { ConsultationOrmEntity } from '../../modules/consultation/infrastructure/persistence/consultation.orm-entity';

/**
 * Consultation Seed Data
 *
 * Seeds the database with test consultation data for development/testing
 */
export class ConsultationSeed {
  /**
   * Run seed
   */
  public static async run(dataSource: DataSource): Promise<void> {
    const consultationRepository = dataSource.getRepository(ConsultationOrmEntity);

    // Clear existing data
    await consultationRepository.clear();

    // Test user IDs (these should match users in your database)
    const clientId1 = '11111111-1111-1111-1111-111111111111';
    const clientId2 = '22222222-2222-2222-2222-222222222222';
    const lawyerId1 = '33333333-3333-3333-3333-333333333333';
    const lawyerId2 = '44444444-4444-4444-4444-444444444444';

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Seed consultations
    const consultations = [
      // 1. Pending consultation (waiting for lawyer confirmation)
      {
        id: 'a0000000-0000-0000-0000-000000000001',
        clientId: clientId1,
        lawyerId: lawyerId1,
        type: 'scheduled',
        status: 'pending',
        description: 'Нужна консультация по ДТП. Произошло столкновение на перекрестке, нужно понять свои права.',
        price: 3000,
        currency: 'RUB',
        scheduledStart: tomorrow,
        scheduledEnd: new Date(tomorrow.getTime() + 60 * 60 * 1000), // +1 hour
        createdAt: now,
        updatedAt: now,
      },

      // 2. Confirmed consultation (lawyer confirmed, waiting for start time)
      {
        id: 'a0000000-0000-0000-0000-000000000002',
        clientId: clientId1,
        lawyerId: lawyerId2,
        type: 'scheduled',
        status: 'confirmed',
        description: 'Консультация по трудовому спору. Работодатель не выплачивает зарплату уже 2 месяца.',
        price: 3500,
        currency: 'RUB',
        scheduledStart: nextWeek,
        scheduledEnd: new Date(nextWeek.getTime() + 90 * 60 * 1000), // +1.5 hours
        confirmedAt: now,
        createdAt: yesterday,
        updatedAt: now,
      },

      // 3. Active consultation (currently in progress)
      {
        id: 'a0000000-0000-0000-0000-000000000003',
        clientId: clientId2,
        lawyerId: lawyerId1,
        type: 'emergency',
        status: 'active',
        description: 'СРОЧНО! Задержан полицией, нужна помощь прямо сейчас!',
        price: 5000,
        currency: 'RUB',
        confirmedAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 min ago
        startedAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 min ago
        createdAt: new Date(now.getTime() - 15 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 5 * 60 * 1000),
      },

      // 4. Completed consultation with rating
      {
        id: 'a0000000-0000-0000-0000-000000000004',
        clientId: clientId1,
        lawyerId: lawyerId1,
        type: 'video',
        status: 'completed',
        description: 'Консультация по наследственному праву. Нужно разобраться с завещанием бабушки.',
        price: 4000,
        currency: 'RUB',
        scheduledStart: lastWeek,
        scheduledEnd: new Date(lastWeek.getTime() + 60 * 60 * 1000),
        confirmedAt: new Date(lastWeek.getTime() - 24 * 60 * 60 * 1000),
        startedAt: lastWeek,
        completedAt: new Date(lastWeek.getTime() + 55 * 60 * 1000), // 55 min later
        rating: 5,
        review: 'Отличная консультация! Юрист объяснил все очень подробно и понятно. Рекомендую!',
        createdAt: new Date(lastWeek.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(lastWeek.getTime() + 2 * 60 * 60 * 1000),
      },

      // 5. Completed consultation without rating
      {
        id: 'a0000000-0000-0000-0000-000000000005',
        clientId: clientId2,
        lawyerId: lawyerId2,
        type: 'phone',
        status: 'completed',
        description: 'Консультация по договору аренды квартиры. Есть вопросы по условиям контракта.',
        price: 2500,
        currency: 'RUB',
        scheduledStart: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        confirmedAt: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
        startedAt: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000),
        createdAt: lastWeek,
        updatedAt: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000),
      },

      // 6. Cancelled consultation (client cancelled)
      {
        id: 'a0000000-0000-0000-0000-000000000006',
        clientId: clientId1,
        lawyerId: lawyerId2,
        type: 'scheduled',
        status: 'cancelled',
        description: 'Консультация по налоговому вычету при покупке квартиры.',
        price: 3000,
        currency: 'RUB',
        scheduledStart: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        cancelledAt: now,
        cancellationReason: 'Передумал, решил вопрос сам',
        createdAt: yesterday,
        updatedAt: now,
      },

      // 7. Cancelled consultation (lawyer was busy)
      {
        id: 'a0000000-0000-0000-0000-000000000007',
        clientId: clientId2,
        lawyerId: lawyerId1,
        type: 'emergency',
        status: 'cancelled',
        description: 'Экстренная консультация по административному правонарушению.',
        price: 5000,
        currency: 'RUB',
        confirmedAt: new Date(yesterday.getTime() + 5 * 60 * 1000),
        cancelledAt: new Date(yesterday.getTime() + 10 * 60 * 1000),
        cancellationReason: 'Юрист не смог подключиться из-за технических проблем',
        createdAt: yesterday,
        updatedAt: new Date(yesterday.getTime() + 10 * 60 * 1000),
      },

      // 8. Expired consultation (no lawyer confirmation)
      {
        id: 'a0000000-0000-0000-0000-000000000008',
        clientId: clientId1,
        lawyerId: lawyerId2,
        type: 'scheduled',
        status: 'expired',
        description: 'Консультация по защите прав потребителя. Магазин отказывается вернуть деньги за бракованный товар.',
        price: 2800,
        currency: 'RUB',
        scheduledStart: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        createdAt: new Date(lastWeek.getTime() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(lastWeek.getTime() + 12 * 60 * 60 * 1000),
      },

      // 9. Failed consultation (technical issues)
      {
        id: 'a0000000-0000-0000-0000-000000000009',
        clientId: clientId2,
        lawyerId: lawyerId1,
        type: 'video',
        status: 'failed',
        description: 'Консультация по семейному праву - вопросы развода и раздела имущества.',
        price: 4500,
        currency: 'RUB',
        scheduledStart: new Date(lastWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
        scheduledEnd: new Date(lastWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        confirmedAt: new Date(lastWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        startedAt: new Date(lastWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
        cancellationReason: 'Видеосвязь не работала, не удалось провести консультацию',
        createdAt: new Date(lastWeek.getTime() + 24 * 60 * 60 * 1000),
        updatedAt: new Date(lastWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      },

      // 10. Another completed consultation with excellent rating
      {
        id: 'a0000000-0000-0000-0000-000000000010',
        clientId: clientId1,
        lawyerId: lawyerId1,
        type: 'chat',
        status: 'completed',
        description: 'Письменная консультация по вопросам защиты авторских прав в интернете.',
        price: 2000,
        currency: 'RUB',
        confirmedAt: new Date(lastWeek.getTime() - 24 * 60 * 60 * 1000),
        startedAt: new Date(lastWeek.getTime() - 23 * 60 * 60 * 1000),
        completedAt: new Date(lastWeek.getTime() - 21 * 60 * 60 * 1000),
        rating: 5,
        review: 'Быстро и по делу. Получил четкие инструкции, как действовать. Спасибо!',
        createdAt: new Date(lastWeek.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(lastWeek.getTime() - 20 * 60 * 60 * 1000),
      },
    ];

    // Insert all consultations
    await consultationRepository.save(consultations);

    console.log(`✅ Seeded ${consultations.length} consultations`);
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

      await ConsultationSeed.run(dataSource);

      await dataSource.destroy();
      console.log('✅ Seed completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    }
  })();
}
