import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

// Infrastructure
import { EmergencyCallOrmEntity } from './infrastructure/persistence/emergency-call.orm-entity';
import { EmergencyCallRepository } from './infrastructure/persistence/emergency-call.repository';

// Application
import { CreateEmergencyCallHandler } from './application/commands/create-emergency-call/create-emergency-call.handler';

// Presentation
import { EmergencyCallController } from './presentation/controllers/emergency-call.controller';

const CommandHandlers = [CreateEmergencyCallHandler];
const QueryHandlers = [];

@Module({
  imports: [TypeOrmModule.forFeature([EmergencyCallOrmEntity]), CqrsModule],
  controllers: [EmergencyCallController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: 'IEmergencyCallRepository',
      useClass: EmergencyCallRepository,
    },
  ],
  exports: ['IEmergencyCallRepository'],
})
export class EmergencyCallModule {}
