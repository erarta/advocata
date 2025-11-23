import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRateLimitDto {
  @ApiProperty({ description: 'Resource path (e.g., /api/users)' })
  @IsString()
  resource: string;

  @ApiProperty({ description: 'HTTP method', enum: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'] })
  @IsEnum(['GET', 'POST', 'PATCH', 'DELETE', 'PUT'])
  method: string;

  @ApiProperty({ description: 'User role' })
  @IsString()
  role: string;

  @ApiProperty({ description: 'Request limit' })
  @IsNumber()
  limit: number;

  @ApiProperty({ description: 'Time window', enum: ['second', 'minute', 'hour', 'day'] })
  @IsEnum(['second', 'minute', 'hour', 'day'])
  window: string;
}
