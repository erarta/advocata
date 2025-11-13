import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Bounded Context Modules (will be created in Phase 1)
// import { IdentityModule } from '@modules/identity/identity.module';
// import { LawyerModule } from '@modules/lawyer/lawyer.module';
// import { ConsultationModule } from '@modules/consultation/consultation.module';
// import { PaymentModule } from '@modules/payment/payment.module';
// import { NotificationModule } from '@modules/notification/notification.module';
// import { DocumentModule } from '@modules/document/document.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Event System
    EventEmitterModule.forRoot(),

    // Database (will be configured in Phase 1)
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: parseInt(process.env.DB_PORT || '5432'),
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_DATABASE,
    //   autoLoadEntities: true,
    //   synchronize: process.env.NODE_ENV === 'development',
    // }),

    // Bounded Context Modules (will be added in Phase 1)
    // IdentityModule,
    // LawyerModule,
    // ConsultationModule,
    // PaymentModule,
    // NotificationModule,
    // DocumentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
