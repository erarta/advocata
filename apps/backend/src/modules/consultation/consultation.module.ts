import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { ConsultationOrmEntity } from './infrastructure/persistence/consultation.orm-entity';
import { ConsultationRepository } from './infrastructure/persistence/consultation.repository';

// Application - Command Handlers
import { BookConsultationHandler } from './application/commands/book-consultation/book-consultation.handler';
import { ConfirmConsultationHandler } from './application/commands/confirm-consultation/confirm-consultation.handler';
import { StartConsultationHandler } from './application/commands/start-consultation/start-consultation.handler';
import { CompleteConsultationHandler } from './application/commands/complete-consultation/complete-consultation.handler';
import { CancelConsultationHandler } from './application/commands/cancel-consultation/cancel-consultation.handler';
import { RateConsultationHandler } from './application/commands/rate-consultation/rate-consultation.handler';

// Application - Query Handlers
import { GetUserConsultationsHandler } from './application/queries/get-user-consultations/get-user-consultations.handler';
import { GetLawyerConsultationsHandler } from './application/queries/get-lawyer-consultations/get-lawyer-consultations.handler';
import { GetConsultationByIdHandler } from './application/queries/get-consultation-by-id/get-consultation-by-id.handler';
import { GetActiveConsultationHandler } from './application/queries/get-active-consultation/get-active-consultation.handler';

// Presentation
import { ConsultationController } from './presentation/controllers/consultation.controller';

const commandHandlers = [
  BookConsultationHandler,
  ConfirmConsultationHandler,
  StartConsultationHandler,
  CompleteConsultationHandler,
  CancelConsultationHandler,
  RateConsultationHandler,
];

const queryHandlers = [
  GetUserConsultationsHandler,
  GetLawyerConsultationsHandler,
  GetConsultationByIdHandler,
  GetActiveConsultationHandler,
];

const repositories = [
  {
    provide: 'IConsultationRepository',
    useClass: ConsultationRepository,
  },
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([ConsultationOrmEntity])],
  controllers: [ConsultationController],
  providers: [...commandHandlers, ...queryHandlers, ...repositories],
  exports: [...repositories],
})
export class ConsultationModule {}
