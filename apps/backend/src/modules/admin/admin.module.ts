import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import existing modules for reuse
import { IdentityModule } from '../identity/identity.module';
import { LawyerModule } from '../lawyer/lawyer.module';
import { ConsultationModule } from '../consultation/consultation.module';
import { PaymentModule } from '../payment/payment.module';
import { DocumentModule } from '../document/document.module';
import { MessageModule } from '../message/message.module';
import { EmergencyCallModule } from '../emergency-call/emergency-call.module';

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

// Import Lawyer Query Handlers
import { GetLawyersHandler } from './application/queries/lawyers/get-lawyers';
import { GetPendingLawyersHandler } from './application/queries/lawyers/get-pending-lawyers';
import { GetLawyerHandler } from './application/queries/lawyers/get-lawyer';
import { GetLawyerPerformanceHandler } from './application/queries/lawyers/get-lawyer-performance';
import { GetLawyerStatsHandler } from './application/queries/lawyers/get-lawyer-stats';
import { GetLawyerReviewsHandler } from './application/queries/lawyers/get-lawyer-reviews';

// Import Lawyer Command Handlers
import { VerifyLawyerHandler } from './application/commands/lawyers/verify-lawyer';
import { UpdateLawyerHandler } from './application/commands/lawyers/update-lawyer';
import { SuspendLawyerHandler } from './application/commands/lawyers/suspend-lawyer';
import { BanLawyerHandler } from './application/commands/lawyers/ban-lawyer';
import { ActivateLawyerHandler } from './application/commands/lawyers/activate-lawyer';
import { DeleteLawyerHandler } from './application/commands/lawyers/delete-lawyer';

// Import Analytics Query Handlers
import { GetDashboardMetricsHandler } from './application/queries/analytics/get-dashboard-metrics';
import { GetRevenueAnalyticsHandler } from './application/queries/analytics/get-revenue-analytics';
import { GetUserGrowthHandler } from './application/queries/analytics/get-user-growth';
import { GetLawyerPerformanceAnalyticsHandler } from './application/queries/analytics/get-lawyer-performance-analytics';
import { GetPlatformAnalyticsHandler } from './application/queries/analytics/get-platform-analytics';
import { GetRevenueMetricsHandler } from './application/queries/analytics/get-revenue-metrics';
import { GetUserGrowthMetricsHandler } from './application/queries/analytics/get-user-growth-metrics';
import { GetGeographicAnalyticsHandler } from './application/queries/analytics/get-geographic-analytics';
import { GetSpecializationAnalyticsHandler } from './application/queries/analytics/get-specialization-analytics';

// Import Consultation Query Handlers
import { GetConsultationsHandler } from './application/queries/consultations/get-consultations';
import { GetLiveConsultationsHandler } from './application/queries/consultations/get-live-consultations';
import { GetConsultationHandler } from './application/queries/consultations/get-consultation';
import { GetConsultationMessagesHandler } from './application/queries/consultations/get-consultation-messages';
import { GetDisputesHandler } from './application/queries/consultations/get-disputes';
import { GetEmergencyCallsHandler } from './application/queries/consultations/get-emergency-calls';
import { GetConsultationStatsHandler } from './application/queries/consultations/get-consultation-stats';

// Import Consultation Command Handlers
import { UpdateConsultationStatusHandler } from './application/commands/consultations/update-consultation-status';
import { IssueRefundHandler } from './application/commands/consultations/issue-refund';
import { ResolveDisputeHandler } from './application/commands/consultations/resolve-dispute';

// Import ORM Entities for TypeORM
import { UserOrmEntity } from '../identity/infrastructure/persistence/user.orm-entity';
import { LawyerOrmEntity } from '../lawyer/infrastructure/persistence/lawyer.orm-entity';
import { ConsultationOrmEntity } from '../consultation/infrastructure/persistence/consultation.orm-entity';
import { MessageOrmEntity } from '../message/infrastructure/persistence/message.orm-entity';
import { EmergencyCallOrmEntity } from '../emergency-call/infrastructure/persistence/emergency-call.orm-entity';
import { PaymentOrmEntity } from '../payment/infrastructure/persistence/payment.orm-entity';

// Import Admin ORM Entities
import { PayoutOrmEntity } from './infrastructure/persistence/payout.orm-entity';
import { RefundOrmEntity } from './infrastructure/persistence/refund.orm-entity';
import { SubscriptionOrmEntity } from './infrastructure/persistence/subscription.orm-entity';
import { AuditLogOrmEntity } from './infrastructure/persistence/audit-log.orm-entity';
import { SupportTicketOrmEntity } from './infrastructure/persistence/support-ticket.orm-entity';
import { LegalPageOrmEntity } from './infrastructure/persistence/legal-page.orm-entity';
import { FaqOrmEntity } from './infrastructure/persistence/faq.orm-entity';
import { PlatformConfigOrmEntity } from './infrastructure/persistence/platform-config.orm-entity';
import { FeatureFlagOrmEntity } from './infrastructure/persistence/feature-flag.orm-entity';

// Import Admin Repositories
import { PayoutRepository } from './infrastructure/persistence/payout.repository';
import { RefundRepository } from './infrastructure/persistence/refund.repository';
import { SubscriptionRepository } from './infrastructure/persistence/subscription.repository';
import { AuditLogRepository } from './infrastructure/persistence/audit-log.repository';
import { SupportTicketRepository } from './infrastructure/persistence/support-ticket.repository';
import { LegalPageRepository } from './infrastructure/persistence/legal-page.repository';
import { FaqRepository } from './infrastructure/persistence/faq.repository';

// Import Admin Services
import { AuditLogService } from './application/services/audit-log.service';

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

// Lawyer handlers
const lawyerQueryHandlers = [
  GetLawyersHandler,
  GetPendingLawyersHandler,
  GetLawyerHandler,
  GetLawyerPerformanceHandler,
  GetLawyerStatsHandler,
  GetLawyerReviewsHandler,
];

const lawyerCommandHandlers = [
  VerifyLawyerHandler,
  UpdateLawyerHandler,
  SuspendLawyerHandler,
  BanLawyerHandler,
  ActivateLawyerHandler,
  DeleteLawyerHandler,
];

// Consultation handlers
const consultationQueryHandlers = [
  GetConsultationsHandler,
  GetLiveConsultationsHandler,
  GetConsultationHandler,
  GetConsultationMessagesHandler,
  GetDisputesHandler,
  GetEmergencyCallsHandler,
  GetConsultationStatsHandler,
];

const consultationCommandHandlers = [
  UpdateConsultationStatusHandler,
  IssueRefundHandler,
  ResolveDisputeHandler,
];

// Analytics handlers
const analyticsQueryHandlers = [
  GetDashboardMetricsHandler,
  GetRevenueAnalyticsHandler,
  GetUserGrowthHandler,
  GetLawyerPerformanceAnalyticsHandler,
  GetPlatformAnalyticsHandler,
  GetRevenueMetricsHandler,
  GetUserGrowthMetricsHandler,
  GetGeographicAnalyticsHandler,
  GetSpecializationAnalyticsHandler,
];

// Import Financial Query Handlers
import { GetTransactionsHandler } from './application/queries/financial/get-transactions';
import { GetPayoutsHandler } from './application/queries/financial/get-payouts';
import { GetPayoutHistoryHandler } from './application/queries/financial/get-payout-history';
import { GetRefundsHandler } from './application/queries/financial/get-refunds';
import { GetCommissionsHandler } from './application/queries/financial/get-commissions';
import { GetFinancialStatsHandler } from './application/queries/financial/get-financial-stats';
import { GetPlatformBalanceHandler } from './application/queries/financial/get-platform-balance';
import { GetSubscriptionsHandler } from './application/queries/financial/get-subscriptions';

// Import Financial Command Handlers
import { ProcessPayoutHandler } from './application/commands/financial/process-payout';
import { ProcessBulkPayoutsHandler } from './application/commands/financial/process-bulk-payouts';
import { ApproveRefundHandler } from './application/commands/financial/approve-refund';
import { RejectRefundHandler } from './application/commands/financial/reject-refund';
import { UpdateCommissionsHandler } from './application/commands/financial/update-commissions';
import { UpdateSubscriptionHandler } from './application/commands/financial/update-subscription';

// Financial handlers
const financialQueryHandlers = [
  GetTransactionsHandler,
  GetPayoutsHandler,
  GetPayoutHistoryHandler,
  GetRefundsHandler,
  GetCommissionsHandler,
  GetFinancialStatsHandler,
  GetPlatformBalanceHandler,
  GetSubscriptionsHandler,
];

const financialCommandHandlers = [
  ProcessPayoutHandler,
  ProcessBulkPayoutsHandler,
  ApproveRefundHandler,
  RejectRefundHandler,
  UpdateCommissionsHandler,
  UpdateSubscriptionHandler,
];

// Import Content Query Handlers
import { GetDocumentTemplatesHandler } from './application/queries/content/get-document-templates';
import { GetDocumentTemplateHandler } from './application/queries/content/get-document-template';
import { GetFaqsHandler } from './application/queries/content/get-faqs';
import { GetLegalInfoPagesHandler } from './application/queries/content/get-legal-info-pages';
import { GetSupportTicketsHandler } from './application/queries/content/get-support-tickets';
import { GetSupportTicketHandler } from './application/queries/content/get-support-ticket';
import { GetOnboardingSlidesHandler } from './application/queries/content/get-onboarding-slides';
import { GetContentStatsHandler } from './application/queries/content/get-content-stats';

// Import Content Command Handlers
import { CreateDocumentTemplateHandler } from './application/commands/content/create-document-template';
import { UpdateDocumentTemplateHandler } from './application/commands/content/update-document-template';
import { DeleteDocumentTemplateHandler } from './application/commands/content/delete-document-template';
import { CreateFaqHandler } from './application/commands/content/create-faq';
import { UpdateFaqHandler } from './application/commands/content/update-faq';
import { DeleteFaqHandler } from './application/commands/content/delete-faq';
import { CreateLegalInfoPageHandler } from './application/commands/content/create-legal-info-page';
import { UpdateLegalInfoPageHandler } from './application/commands/content/update-legal-info-page';
import { PublishLegalInfoPageHandler } from './application/commands/content/publish-legal-info-page';
import { AssignSupportTicketHandler } from './application/commands/content/assign-support-ticket';
import { ReplySupportTicketHandler } from './application/commands/content/reply-support-ticket';
import { UpdateSupportTicketStatusHandler } from './application/commands/content/update-support-ticket-status';
import { CreateOnboardingSlideHandler } from './application/commands/content/create-onboarding-slide';
import { UpdateOnboardingSlideHandler } from './application/commands/content/update-onboarding-slide';
import { DeleteOnboardingSlideHandler } from './application/commands/content/delete-onboarding-slide';

// Import Settings Query Handlers
import { GetPlatformConfigHandler } from './application/queries/settings/get-platform-config';
import { GetFeatureFlagsHandler } from './application/queries/settings/get-feature-flags';
import { GetNotificationTemplatesHandler } from './application/queries/settings/get-notification-templates';
import { GetNotificationTemplateHandler } from './application/queries/settings/get-notification-template';
import { GetRateLimitsHandler } from './application/queries/settings/get-rate-limits';
import { GetAdminRolesHandler } from './application/queries/settings/get-admin-roles';
import { GetAdminUsersHandler } from './application/queries/settings/get-admin-users';
import { GetAuditLogHandler } from './application/queries/settings/get-audit-log';
import { GetAuditLogStatsHandler } from './application/queries/settings/get-audit-log-stats';
import { GetEmailConfigHandler } from './application/queries/settings/get-email-config';
import { GetSMSConfigHandler } from './application/queries/settings/get-sms-config';
import { GetSystemHealthHandler } from './application/queries/settings/get-system-health';

// Import Settings Command Handlers
import { UpdatePlatformConfigHandler } from './application/commands/settings/update-platform-config';
import { UpdateFeatureFlagHandler } from './application/commands/settings/update-feature-flag';
import { UpdateNotificationTemplateHandler } from './application/commands/settings/update-notification-template';
import { UpdateEmailConfigHandler } from './application/commands/settings/update-email-config';
import { UpdateSMSConfigHandler } from './application/commands/settings/update-sms-config';
import { UpdateRateLimitHandler } from './application/commands/settings/update-rate-limit';
import { CreateAdminRoleHandler } from './application/commands/settings/create-admin-role';
import { UpdateAdminRoleHandler } from './application/commands/settings/update-admin-role';
import { AssignAdminRoleHandler } from './application/commands/settings/assign-admin-role';

// Content handlers
const contentQueryHandlers = [
  GetDocumentTemplatesHandler,
  GetDocumentTemplateHandler,
  GetFaqsHandler,
  GetLegalInfoPagesHandler,
  GetSupportTicketsHandler,
  GetSupportTicketHandler,
  GetOnboardingSlidesHandler,
  GetContentStatsHandler,
];

const contentCommandHandlers = [
  CreateDocumentTemplateHandler,
  UpdateDocumentTemplateHandler,
  DeleteDocumentTemplateHandler,
  CreateFaqHandler,
  UpdateFaqHandler,
  DeleteFaqHandler,
  CreateLegalInfoPageHandler,
  UpdateLegalInfoPageHandler,
  PublishLegalInfoPageHandler,
  AssignSupportTicketHandler,
  ReplySupportTicketHandler,
  UpdateSupportTicketStatusHandler,
  CreateOnboardingSlideHandler,
  UpdateOnboardingSlideHandler,
  DeleteOnboardingSlideHandler,
];

// Settings handlers
const settingsQueryHandlers = [
  GetPlatformConfigHandler,
  GetFeatureFlagsHandler,
  GetNotificationTemplatesHandler,
  GetNotificationTemplateHandler,
  GetRateLimitsHandler,
  GetAdminRolesHandler,
  GetAdminUsersHandler,
  GetAuditLogHandler,
  GetAuditLogStatsHandler,
  GetEmailConfigHandler,
  GetSMSConfigHandler,
  GetSystemHealthHandler,
];

const settingsCommandHandlers = [
  UpdatePlatformConfigHandler,
  UpdateFeatureFlagHandler,
  UpdateNotificationTemplateHandler,
  UpdateEmailConfigHandler,
  UpdateSMSConfigHandler,
  UpdateRateLimitHandler,
  CreateAdminRoleHandler,
  UpdateAdminRoleHandler,
  AssignAdminRoleHandler,
];

// Combine all handlers
const commandHandlers = [
  ...userCommandHandlers,
  ...lawyerCommandHandlers,
  ...consultationCommandHandlers,
  ...financialCommandHandlers,
  ...contentCommandHandlers,
  ...settingsCommandHandlers,
];

const queryHandlers = [
  ...userQueryHandlers,
  ...lawyerQueryHandlers,
  ...consultationQueryHandlers,
  ...analyticsQueryHandlers,
  ...financialQueryHandlers,
  ...contentQueryHandlers,
  ...settingsQueryHandlers,
];

@Module({
  imports: [
    CqrsModule,
    // TypeORM entities for query/command handlers
    TypeOrmModule.forFeature([
      // Existing entities
      UserOrmEntity,
      LawyerOrmEntity,
      ConsultationOrmEntity,
      MessageOrmEntity,
      EmergencyCallOrmEntity,
      PaymentOrmEntity,
      // Admin entities
      PayoutOrmEntity,
      RefundOrmEntity,
      SubscriptionOrmEntity,
      AuditLogOrmEntity,
      SupportTicketOrmEntity,
      LegalPageOrmEntity,
      FaqOrmEntity,
      PlatformConfigOrmEntity,
      FeatureFlagOrmEntity,
    ]),
    // Import existing modules to reuse their services and repositories
    IdentityModule,
    LawyerModule,
    ConsultationModule,
    PaymentModule,
    DocumentModule,
    MessageModule,
    EmergencyCallModule,
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

    // Repositories
    PayoutRepository,
    RefundRepository,
    SubscriptionRepository,
    AuditLogRepository,
    SupportTicketRepository,
    LegalPageRepository,
    FaqRepository,

    // Services
    AuditLogService,

    // Command handlers
    ...commandHandlers,

    // Query handlers
    ...queryHandlers,
  ],
  exports: [
    // Export guard for use in other modules if needed
    AdminAuthGuard,
    // Export services for use in other modules
    AuditLogService,
    // Export repositories
    PayoutRepository,
    RefundRepository,
    SubscriptionRepository,
    AuditLogRepository,
    SupportTicketRepository,
  ],
})
export class AdminModule {}
