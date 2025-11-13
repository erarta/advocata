import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { VerifyPhoneCommand } from './verify-phone.command';
import { Result } from '@shared/domain/result';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { IOtpService } from '../../../domain/services/otp.service.interface';

/**
 * VerifyPhoneCommandHandler
 *
 * Handles phone verification with OTP
 */
@CommandHandler(VerifyPhoneCommand)
export class VerifyPhoneCommandHandler
  implements ICommandHandler<VerifyPhoneCommand, Result<void>>
{
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IOtpService')
    private readonly otpService: IOtpService,
  ) {}

  async execute(command: VerifyPhoneCommand): Promise<Result<void>> {
    // 1. Find user
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      return Result.fail('User not found');
    }

    // 2. Verify OTP code
    const isValidOtp = await this.otpService.verify(
      user.phoneNumber.value,
      command.otpCode,
    );

    if (!isValidOtp) {
      return Result.fail('Invalid or expired OTP code');
    }

    // 3. Mark phone as verified (domain logic)
    const verificationResult = user.verifyPhone();
    if (verificationResult.isFailure) {
      return Result.fail(verificationResult.error);
    }

    // 4. Save user
    await this.userRepository.save(user);

    // 5. Delete OTP code after successful verification
    await this.otpService.delete(user.phoneNumber.value);

    return Result.ok();
  }
}
