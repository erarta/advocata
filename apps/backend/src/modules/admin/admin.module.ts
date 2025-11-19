import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Import existing modules for reuse
import { IdentityModule } from '../identity/identity.module';
import { LawyerModule } from '../lawyer/lawyer.module';
import { ConsultationModule } from '../consultation/consultation.module';
import { PaymentModule } from '../payment/payment.module';
import { DocumentModule } from '../document/document.module';
import { MessageModule } from '../message/message.module';

// Import controllers
import { AdminUsersController } from './presentation/controllers/admin-users.controller';
import { AdminLawyersController } from './presentation/controllers/admin-lawyers.controller';
import { AdminConsultationsController } from './presentation/controllers/admin-consultations.controller';
import { AdminAnalyticsController } from './presentation/controllers/admin-analytics.controller';
import { AdminFinancialController } from './presentation/controllers/admin-financial.controller';
import { AdminContentController } from './presentation/controllers/admin-content.controller';
import { AdminSettingsController } from './presentation/controllers/admin-settings.controller';

// Import guards (will be used by controllers)
import { AdminAuthGuard } from './infrastructure/guards/admin-auth.guard';

// TODO: Import command handlers when implemented
// import { ... } from './application/commands/...';

// TODO: Import query handlers when implemented
// import { ... } from './application/queries/...';

const commandHandlers = [
  // TODO: Add command handlers here
  // Example:
  // SuspendUserHandler,
  // BanUserHandler,
  // VerifyLawyerHandler,
  // etc.
];

const queryHandlers = [
  // TODO: Add query handlers here
  // Example:
  // GetUsersHandler,
  // GetLawyersHandler,
  // GetDashboardMetricsHandler,
  // etc.
];

@Module({
  imports: [
    CqrsModule,
    // Import existing modules to reuse their services and repositories
    IdentityModule,
    LawyerModule,
    ConsultationModule,
    PaymentModule,
    DocumentModule,
    MessageModule,
  ],
  controllers: [
    AdminUsersController,
    AdminLawyersController,
    AdminConsultationsController,
    AdminAnalyticsController,
    AdminFinancialController,
    AdminContentController,
    AdminSettingsController,
  ],
  providers: [
    // Guards
    AdminAuthGuard,

    // Command handlers
    ...commandHandlers,

    // Query handlers
    ...queryHandlers,
  ],
  exports: [
    // Export guard for use in other modules if needed
    AdminAuthGuard,
  ],
})
export class AdminModule {}
