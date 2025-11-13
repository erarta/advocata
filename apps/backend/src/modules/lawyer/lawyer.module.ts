import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { LawyerOrmEntity } from './infrastructure/persistence/lawyer.orm-entity';
import { LawyerRepository } from './infrastructure/persistence/lawyer.repository';

// Application - Command Handlers
import { RegisterLawyerCommandHandler } from './application/commands/register-lawyer/register-lawyer.handler';
import { ApproveLawyerCommandHandler } from './application/commands/approve-lawyer/approve-lawyer.handler';

// Application - Query Handlers
import { SearchLawyersQueryHandler } from './application/queries/search-lawyers/search-lawyers.handler';

// Presentation
import { LawyerController } from './presentation/controllers/lawyer.controller';

const commandHandlers = [
  RegisterLawyerCommandHandler,
  ApproveLawyerCommandHandler,
];

const queryHandlers = [
  SearchLawyersQueryHandler,
];

const repositories = [
  {
    provide: 'ILawyerRepository',
    useClass: LawyerRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([LawyerOrmEntity]),
  ],
  controllers: [LawyerController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
  ],
  exports: [
    ...repositories,
  ],
})
export class LawyerModule {}
