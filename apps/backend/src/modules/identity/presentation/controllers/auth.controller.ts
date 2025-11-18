import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { RegisterUserRequestDto } from '../dtos/register-user.request.dto';
import { RegisterUserResponseDto } from '../dtos/register-user.response.dto';
import { VerifyPhoneRequestDto } from '../dtos/verify-phone.request.dto';
import { RegisterUserCommand } from '../../application/commands/register-user';
import { VerifyPhoneCommand } from '../../application/commands/verify-phone';
import { IOtpService } from '../../domain/services/otp.service.interface';

/**
 * AuthController
 *
 * Handles authentication-related endpoints:
 * - User registration
 * - Phone verification
 * - OTP resend
 */
@ApiTags('identity')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IOtpService')
    private readonly otpService: IOtpService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered. OTP sent to phone.',
    type: RegisterUserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input or user already exists' })
  async register(
    @Body() dto: RegisterUserRequestDto,
  ): Promise<RegisterUserResponseDto> {
    const command = new RegisterUserCommand(
      dto.phoneNumber,
      dto.firstName,
      dto.lastName,
      dto.role,
    );

    const result = await this.commandBus.execute(command);

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    // Generate and send OTP
    const otpCode = await this.otpService.generate(dto.phoneNumber);

    const response = new RegisterUserResponseDto();
    response.userId = result.value.userId;
    response.phoneNumber = result.value.phoneNumber;

    // Only return OTP in development for testing
    if (process.env.NODE_ENV === 'development') {
      response.otpCode = otpCode;
    }

    return response;
  }

  @Post('verify-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify phone number with OTP' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Phone successfully verified',
  })
  @ApiBadRequestResponse({ description: 'Invalid OTP code' })
  async verifyPhone(@Body() dto: VerifyPhoneRequestDto): Promise<{ message: string }> {
    const command = new VerifyPhoneCommand(dto.userId, dto.otpCode);

    const result = await this.commandBus.execute(command);

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return { message: 'Phone successfully verified' };
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OTP resent successfully',
  })
  async resendOtp(
    @Body('phoneNumber') phoneNumber: string,
  ): Promise<{ message: string; otpCode?: string }> {
    try {
      const otpCode = await this.otpService.resend(phoneNumber);

      const response: { message: string; otpCode?: string } = {
        message: 'OTP sent successfully',
      };

      // Only return OTP in development
      if (process.env.NODE_ENV === 'development') {
        response.otpCode = otpCode;
      }

      return response;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
