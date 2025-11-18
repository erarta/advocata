import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../domain/enums';

/**
 * RegisterUserRequestDto
 *
 * Request DTO for user registration
 */
export class RegisterUserRequestDto {
  @ApiProperty({
    description: 'Phone number in format +7XXXXXXXXXX',
    example: '+79991234567',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({
    description: 'First name',
    example: 'Иван',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Иванов',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  lastName: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.Client,
  })
  @IsEnum(UserRole)
  role: UserRole;
}
