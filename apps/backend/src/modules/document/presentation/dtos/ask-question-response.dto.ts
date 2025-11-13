import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentReferenceDto {
  @ApiProperty()
  documentId: string;

  @ApiProperty()
  chunkIndex: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  similarity: number;
}

export class TokenUsageDto {
  @ApiProperty()
  promptTokens: number;

  @ApiProperty()
  completionTokens: number;

  @ApiProperty()
  totalTokens: number;
}

export class AskQuestionResponseDto {
  @ApiProperty({ description: 'AI-generated answer' })
  answer: string;

  @ApiProperty({ description: 'Source document references', type: [DocumentReferenceDto] })
  references: DocumentReferenceDto[];

  @ApiPropertyOptional({ description: 'Token usage statistics' })
  usage?: TokenUsageDto;

  @ApiProperty({ description: 'Response timestamp' })
  timestamp: string;
}
