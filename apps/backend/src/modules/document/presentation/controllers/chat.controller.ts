import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Observable, from, map, concatMap } from 'rxjs';
import { AskQuestionQuery } from '../../application/queries/ask-question';
import { AskQuestionDto } from '../dtos/ask-question.dto';
import { AskQuestionResponseDto } from '../dtos/ask-question-response.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly queryBus: QueryBus) {}

  @Post('ask')
  @ApiOperation({ summary: 'Ask a question to the AI lawyer assistant' })
  @ApiResponse({
    status: 200,
    description: 'Question answered successfully',
    type: AskQuestionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  async askQuestion(
    @Request() req,
    @Body() dto: AskQuestionDto,
  ): Promise<AskQuestionResponseDto> {
    const userId = req.user.userId;

    const query = new AskQuestionQuery(
      dto.question,
      userId,
      dto.lawyerId,
      dto.conversationHistory,
    );

    const result = await this.queryBus.execute(query);

    return {
      answer: result.answer,
      references: result.references.map((ref) => ({
        documentId: ref.documentId,
        chunkIndex: ref.chunkIndex,
        content: ref.content,
        similarity: ref.similarity,
      })),
      usage: result.usage,
      timestamp: new Date().toISOString(),
    };
  }

  @Sse('ask/stream')
  @ApiOperation({ summary: 'Ask a question with streaming response (Server-Sent Events)' })
  @ApiResponse({
    status: 200,
    description: 'Streaming response',
  })
  askQuestionStream(
    @Request() req,
    @Body() dto: AskQuestionDto,
  ): Observable<MessageEvent> {
    const userId = req.user.userId;

    const query = new AskQuestionQuery(
      dto.question,
      userId,
      dto.lawyerId,
      dto.conversationHistory,
    );

    // Note: This is a simplified example. For true streaming, you'd need to implement
    // a streaming version of the AskQuestionHandler that yields chunks as they're generated
    return from(this.queryBus.execute(query)).pipe(
      map((result) => ({
        data: {
          answer: result.answer,
          references: result.references,
          usage: result.usage,
          timestamp: new Date().toISOString(),
        },
      })),
    );
  }
}
