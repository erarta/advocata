import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PayoutMethod {
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  WALLET = 'wallet',
}

export class ProcessPayoutDto {
  @ApiProperty({ enum: PayoutMethod, description: 'Payout method' })
  @IsEnum(PayoutMethod)
  method: PayoutMethod;

  @ApiPropertyOptional({ description: 'Processing notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
