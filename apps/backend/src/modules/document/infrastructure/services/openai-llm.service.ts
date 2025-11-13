import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  ILLMService,
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResult,
} from '../../domain/services/llm.service';
import { Result } from '../../../../shared/domain/result';

@Injectable()
export class OpenAILLMService implements ILLMService {
  private readonly logger = new Logger(OpenAILLMService.name);
  private readonly openai: OpenAI;
  private readonly defaultModel: string = 'gpt-4-turbo-preview';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    this.openai = new OpenAI({ apiKey });
  }

  async chat(
    messages: ChatMessage[],
    options?: ChatCompletionOptions,
  ): Promise<Result<ChatCompletionResult>> {
    try {
      this.logger.log(`Generating chat completion with ${messages.length} messages`);

      const response = await this.openai.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
      });

      const choice = response.choices[0];

      if (!choice || !choice.message) {
        return Result.fail('No response from OpenAI');
      }

      const result: ChatCompletionResult = {
        content: choice.message.content || '',
        finishReason: choice.finish_reason,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };

      this.logger.log(
        `Chat completion generated: ${result.usage?.totalTokens || 0} tokens`,
      );

      return Result.ok(result);
    } catch (error) {
      this.logger.error(`OpenAI API error: ${error.message}`, error.stack);
      return Result.fail(`OpenAI API error: ${error.message}`);
    }
  }

  async streamChat(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options?: ChatCompletionOptions,
  ): Promise<Result<void>> {
    try {
      this.logger.log(`Starting streaming chat completion with ${messages.length} messages`);

      const stream = await this.openai.chat.completions.create({
        model: options?.model || this.defaultModel,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2000,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }

      this.logger.log('Streaming chat completion finished');

      return Result.ok();
    } catch (error) {
      this.logger.error(`OpenAI streaming error: ${error.message}`, error.stack);
      return Result.fail(`OpenAI streaming error: ${error.message}`);
    }
  }
}
