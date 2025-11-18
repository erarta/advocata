import { ApiProperty } from '@nestjs/swagger';

/**
 * RegisterUserResponseDto
 *
 * Response DTO for user registration
 */
export class RegisterUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+79991234567',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'OTP code sent to phone (only in development)',
    example: '123456',
    required: false,
  })
  otpCode?: string;
}
