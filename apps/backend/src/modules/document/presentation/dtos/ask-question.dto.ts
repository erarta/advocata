import { IsString, IsOptional, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ConversationMessage {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsString()
  role: 'user' | 'assistant';

  @ApiProperty()
  @IsString()
  content: string;
}

export class AskQuestionDto {
  @ApiProperty({ description: 'User question', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  question: string;

  @ApiPropertyOptional({ description: 'Filter by specific lawyer ID' })
  @IsOptional()
  @IsString()
  lawyerId?: string;

  @ApiPropertyOptional({
    description: 'Conversation history for context',
    type: [ConversationMessage],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessage)
  conversationHistory?: ConversationMessage[];
}
