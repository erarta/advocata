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

// Import User Query Handlers
import { GetUsersHandler } from './application/queries/users/get-users';
import { GetUserHandler } from './application/queries/users/get-user';
import { GetUserStatsHandler } from './application/queries/users/get-user-stats';
import { GetUserActivityHandler } from './application/queries/users/get-user-activity';

// Import User Command Handlers
import { UpdateUserHandler } from './application/commands/users/update-user';
import { SuspendUserHandler } from './application/commands/users/suspend-user';
import { BanUserHandler } from './application/commands/users/ban-user';
import { ActivateUserHandler } from './application/commands/users/activate-user';
import { DeleteUserHandler } from './application/commands/users/delete-user';

// User handlers
const userQueryHandlers = [
  GetUsersHandler,
  GetUserHandler,
  GetUserStatsHandler,
  GetUserActivityHandler,
];

const userCommandHandlers = [
  UpdateUserHandler,
  SuspendUserHandler,
  BanUserHandler,
  ActivateUserHandler,
  DeleteUserHandler,
];

// TODO: Add Lawyer handlers
const lawyerQueryHandlers = [];
const lawyerCommandHandlers = [];

// TODO: Add Consultation handlers
const consultationQueryHandlers = [];
const consultationCommandHandlers = [];

// TODO: Add Analytics handlers
const analyticsQueryHandlers = [];

// TODO: Add Financial handlers
const financialQueryHandlers = [];
const financialCommandHandlers = [];

// Combine all handlers
const commandHandlers = [
  ...userCommandHandlers,
  ...lawyerCommandHandlers,
  ...consultationCommandHandlers,
  ...financialCommandHandlers,
];

const queryHandlers = [
  ...userQueryHandlers,
  ...lawyerQueryHandlers,
  ...consultationQueryHandlers,
  ...analyticsQueryHandlers,
  ...financialQueryHandlers,
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
