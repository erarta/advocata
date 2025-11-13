import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { AskQuestionQuery } from './ask-question.query';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { IDocumentProcessor } from '../../../domain/services/document-processor.service';
import { ILLMService, ChatMessage } from '../../../domain/services/llm.service';

export interface DocumentReference {
  documentId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

export interface AskQuestionResult {
  answer: string;
  references: DocumentReference[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

@QueryHandler(AskQuestionQuery)
@Injectable()
export class AskQuestionHandler implements IQueryHandler<AskQuestionQuery, AskQuestionResult> {
  private readonly logger = new Logger(AskQuestionHandler.name);
  private readonly topK: number = 5; // Number of similar chunks to retrieve

  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly documentProcessor: IDocumentProcessor,
    private readonly llmService: ILLMService,
  ) {}

  async execute(query: AskQuestionQuery): Promise<AskQuestionResult> {
    this.logger.log(`Processing question: "${query.question}"`);

    try {
      // 1. Generate embedding for the question
      this.logger.log('Generating question embedding');
      const embeddings = await this.documentProcessor.generateEmbeddings([query.question]);
      const questionEmbedding = embeddings[0];

      // 2. Search for similar document chunks
      this.logger.log(`Searching for top ${this.topK} similar chunks`);
      const similarChunks = await this.documentRepository.searchSimilarChunks(
        questionEmbedding,
        this.topK,
        query.lawyerId,
      );

      this.logger.log(`Found ${similarChunks.length} relevant chunks`);

      if (similarChunks.length === 0) {
        return {
          answer:
            'Извините, я не нашел информации по вашему вопросу в загруженных документах. Пожалуйста, уточните вопрос или обратитесь к юристу напрямую.',
          references: [],
        };
      }

      // 3. Calculate similarity scores
      const references: DocumentReference[] = similarChunks.map((chunk) => ({
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        similarity: this.calculateCosineSimilarity(questionEmbedding, chunk.embedding),
      }));

      // 4. Build context from retrieved chunks
      const context = similarChunks.map((chunk, idx) => `[${idx + 1}] ${chunk.content}`).join('\n\n');

      // 5. Build prompt messages
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: this.buildSystemPrompt(),
        },
        {
          role: 'user',
          content: this.buildUserPrompt(query.question, context),
        },
      ];

      // Add conversation history if provided
      if (query.conversationHistory && query.conversationHistory.length > 0) {
        const historyMessages: ChatMessage[] = query.conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        messages.splice(1, 0, ...historyMessages);
      }

      // 6. Generate answer using LLM
      this.logger.log('Generating answer with LLM');
      const completionResult = await this.llmService.chat(messages, {
        temperature: 0.3, // Lower temperature for more factual responses
        maxTokens: 1500,
      });

      if (completionResult.isFailure) {
        throw new Error(completionResult.error);
      }

      const { content, usage } = completionResult.value;

      this.logger.log('Answer generated successfully');

      return {
        answer: content,
        references,
        usage,
      };
    } catch (error) {
      this.logger.error(`Error processing question: ${error.message}`, error.stack);
      throw error;
    }
  }

  private buildSystemPrompt(): string {
    return `Вы — AI-ассистент юриста, специализирующийся на российском праве.

Ваша задача — предоставлять точные и полезные ответы на юридические вопросы на основе предоставленных документов.

Правила:
1. Отвечайте ТОЛЬКО на основе информации из предоставленного контекста
2. Если информации недостаточно, честно скажите об этом
3. Используйте профессиональный, но понятный язык
4. Указывайте ссылки на источники, используя номера [1], [2] и т.д.
5. Если вопрос не связан с юридической тематикой, вежливо перенаправьте к юристу
6. Не давайте окончательных юридических заключений — рекомендуйте консультацию с юристом для важных решений

Формат ответа:
- Краткий прямой ответ на вопрос
- Объяснение с указанием источников
- При необходимости — практические рекомендации
- Напоминание о консультации с юристом для важных вопросов`;
  }

  private buildUserPrompt(question: string, context: string): string {
    return `Контекст из юридических документов:

${context}

---

Вопрос клиента: ${question}

Пожалуйста, предоставьте ответ на основе приведенного контекста.`;
  }

  private calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }
}
