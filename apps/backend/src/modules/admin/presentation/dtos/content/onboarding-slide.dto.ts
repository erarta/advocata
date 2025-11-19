import { IsString, IsOptional, IsEnum, IsNumber, IsUrl, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OnboardingTargetAudience {
  CLIENT = 'client',
  LAWYER = 'lawyer',
}

export enum OnboardingSlideStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateOnboardingSlideDto {
  @ApiProperty({ enum: OnboardingTargetAudience, description: 'Target audience' })
  @IsEnum(OnboardingTargetAudience)
  targetAudience: OnboardingTargetAudience;

  @ApiProperty({ description: 'Slide title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Slide description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Image URL' })
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Button text' })
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiProperty({ description: 'Display order' })
  @IsNumber()
  order: number;
}

export class UpdateOnboardingSlideDto {
  @ApiPropertyOptional({ enum: OnboardingTargetAudience, description: 'Target audience' })
  @IsOptional()
  @IsEnum(OnboardingTargetAudience)
  targetAudience?: OnboardingTargetAudience;

  @ApiPropertyOptional({ description: 'Slide title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Slide description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Button text' })
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ enum: OnboardingSlideStatus, description: 'Slide status' })
  @IsOptional()
  @IsEnum(OnboardingSlideStatus)
  status?: OnboardingSlideStatus;
}

export class GetOnboardingSlidesDto {
  @ApiPropertyOptional({ enum: OnboardingTargetAudience, description: 'Filter by target audience' })
  @IsOptional()
  @IsEnum(OnboardingTargetAudience)
  targetAudience?: OnboardingTargetAudience;

  @ApiPropertyOptional({ enum: OnboardingSlideStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(OnboardingSlideStatus)
  status?: OnboardingSlideStatus;
}
