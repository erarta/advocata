import { IsOptional, IsNumber, Min, Max, IsBoolean, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SpecializationType } from '../../domain/enums';

/**
 * SearchLawyersRequestDto
 *
 * Request DTO for searching lawyers
 */
export class SearchLawyersRequestDto {
  @ApiProperty({
    description: 'Filter by specializations',
    enum: SpecializationType,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(SpecializationType, { each: true })
  specializations?: SpecializationType[];

  @ApiProperty({
    description: 'Minimum rating (1-5)',
    example: 4.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  minRating?: number;

  @ApiProperty({
    description: 'Minimum years of experience',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minExperience?: number;

  @ApiProperty({
    description: 'Filter by availability',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isAvailable?: boolean;

  @ApiProperty({
    description: 'Number of results to return',
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit: number = 20;

  @ApiProperty({
    description: 'Number of results to skip',
    example: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset: number = 0;
}
