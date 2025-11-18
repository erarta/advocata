import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';

// Bounded Context Modules
import { IdentityModule } from './modules/identity/identity.module';
import { LawyerModule } from './modules/lawyer/lawyer.module';
import { DocumentModule } from './modules/document/document.module';
import { ConsultationModule } from './modules/consultation/consultation.module';
import { MessageModule } from './modules/message/message.module';
import { PaymentModule } from './modules/payment/payment.module';
// import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Event System
    EventEmitterModule.forRoot(),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'advocata',
      password: process.env.DB_PASSWORD || 'advocata_dev_password',
      database: process.env.DB_DATABASE || 'advocata',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),

    // Redis & Job Queue
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),

    // Bounded Context Modules
    IdentityModule,
    LawyerModule,
    DocumentModule,
    ConsultationModule,
    MessageModule,
    PaymentModule,
    // NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
