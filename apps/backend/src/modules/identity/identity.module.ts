import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Infrastructure
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { OtpService } from './infrastructure/services/otp.service';
import { NotificationModule } from '../notification/notification.module';

// Application - Command Handlers
import { RegisterUserCommandHandler } from './application/commands/register-user';
import { VerifyPhoneCommandHandler } from './application/commands/verify-phone';

// Application - Query Handlers
import { GetUserByIdQueryHandler } from './application/queries/get-user-by-id';

// Presentation
import { AuthController } from './presentation/controllers/auth.controller';
import { UserController } from './presentation/controllers/user.controller';

const commandHandlers = [
  RegisterUserCommandHandler,
  VerifyPhoneCommandHandler,
];

const queryHandlers = [
  GetUserByIdQueryHandler,
];

const repositories = [
  {
    provide: 'IUserRepository',
    useClass: UserRepository,
  },
];

const services = [
  {
    provide: 'IOtpService',
    useClass: OtpService,
  },
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    TypeOrmModule.forFeature([UserOrmEntity]),
    forwardRef(() => NotificationModule),
  ],
  controllers: [AuthController, UserController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    ...services,
  ],
  exports: [
    ...repositories,
    ...services,
  ],
})
export class IdentityModule {}
