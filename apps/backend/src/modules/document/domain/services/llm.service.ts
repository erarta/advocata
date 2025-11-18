import { Result } from '../../../../shared/domain/result';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResult {
  content: string;
  finishReason: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ILLMService {
  chat(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<Result<ChatCompletionResult>>;
  streamChat(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options?: ChatCompletionOptions,
  ): Promise<Result<void>>;
}
