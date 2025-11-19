import { IsString, IsOptional, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({ description: 'FAQ question' })
  @IsString()
  question: string;

  @ApiProperty({ description: 'FAQ answer' })
  @IsString()
  answer: string;

  @ApiProperty({ description: 'FAQ category' })
  @IsString()
  category: string;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  order?: number = 0;
}

export class UpdateFaqDto {
  @ApiPropertyOptional({ description: 'FAQ question' })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiPropertyOptional({ description: 'FAQ answer' })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({ description: 'FAQ category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  order?: number;
}
