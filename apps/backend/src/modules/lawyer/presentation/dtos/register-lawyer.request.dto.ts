import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Length,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SpecializationType } from '../../domain/enums';

/**
 * RegisterLawyerRequestDto
 *
 * Request DTO for lawyer registration
 */
export class RegisterLawyerRequestDto {
  @ApiProperty({
    description: 'User ID from Identity context',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'License/Bar number',
    example: 'ADV123456',
  })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({
    description: 'Legal specializations',
    enum: SpecializationType,
    isArray: true,
    example: [SpecializationType.TrafficAccidents, SpecializationType.CriminalLaw],
  })
  @IsArray()
  @IsEnum(SpecializationType, { each: true })
  specializations: SpecializationType[];

  @ApiProperty({
    description: 'Years of experience',
    example: 5,
    minimum: 0,
    maximum: 70,
  })
  @IsNumber()
  @Min(0)
  @Max(70)
  experienceYears: number;

  @ApiProperty({
    description: 'Professional biography',
    example: 'Experienced lawyer specializing in traffic accidents...',
    minLength: 50,
    maxLength: 1000,
  })
  @IsString()
  @Length(50, 1000)
  bio: string;

  @ApiProperty({
    description: 'Education and qualifications',
    example: 'Moscow State University, Law Faculty, 2015',
    maxLength: 500,
  })
  @IsString()
  @Length(1, 500)
  education: string;

  @ApiProperty({
    description: 'Hourly rate in rubles',
    example: 3000,
    minimum: 500,
    maximum: 50000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(500)
  @Max(50000)
  hourlyRate?: number;
}
