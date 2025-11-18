import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import { OpenAI } from 'openai';
import {
  IDocumentProcessor,
  ExtractedContent,
  TextChunk,
} from '../../domain/services/document-processor.interface';
import { DocumentType } from '../../domain/entities/document.entity';

@Injectable()
export class DocumentProcessorService implements IDocumentProcessor {
  private readonly logger = new Logger(DocumentProcessorService.name);
  private readonly openai: OpenAI;
  private readonly chunkSize: number = 1000;
  private readonly chunkOverlap: number = 200;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async extractContent(
    fileBuffer: Buffer,
    fileType: DocumentType,
  ): Promise<ExtractedContent> {
    this.logger.log(`Extracting content from ${fileType} document`);

    try {
      switch (fileType) {
        case DocumentType.PDF:
          return await this.extractFromPDF(fileBuffer);
        case DocumentType.IMAGE:
          return await this.extractFromImage(fileBuffer);
        case DocumentType.TEXT:
          return await this.extractFromText(fileBuffer);
        default:
          throw new Error(`Unsupported document type: ${fileType}`);
      }
    } catch (error) {
      this.logger.error(`Failed to extract content: ${error.message}`, error.stack);
      throw error;
    }
  }

  async chunkText(
    text: string,
    chunkSize: number = this.chunkSize,
    overlap: number = this.chunkOverlap,
  ): Promise<TextChunk[]> {
    this.logger.log(`Chunking text (size: ${text.length} chars)`);

    const chunks: TextChunk[] = [];
    const sentences = this.splitIntoSentences(text);

    let currentChunk = '';
    let chunkIndex = 0;

    for (const sentence of sentences) {
      // If adding this sentence exceeds chunk size, save current chunk
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            length: currentChunk.length,
            sentenceCount: currentChunk.split(/[.!?]+/).length,
          },
        });

        // Keep overlap from previous chunk
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 5)); // Approx 5 chars per word
        currentChunk = overlapWords.join(' ') + ' ';
        chunkIndex++;
      }

      currentChunk += sentence + ' ';
    }

    // Add final chunk
    if (currentChunk.trim().length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          length: currentChunk.length,
          sentenceCount: currentChunk.split(/[.!?]+/).length,
        },
      });
    }

    this.logger.log(`Created ${chunks.length} chunks`);
    return chunks;
  }

  async generateEmbeddings(chunks: string[]): Promise<number[][]> {
    this.logger.log(`Generating embeddings for ${chunks.length} chunks`);

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks,
      });

      const embeddings = response.data.map((item) => item.embedding);
      this.logger.log(`Generated ${embeddings.length} embeddings`);

      return embeddings;
    } catch (error) {
      this.logger.error(`Failed to generate embeddings: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods

  private async extractFromPDF(fileBuffer: Buffer): Promise<ExtractedContent> {
    const data = await pdfParse(fileBuffer);

    return {
      text: data.text,
      pageCount: data.numpages,
      metadata: {
        info: data.info,
        version: data.version,
      },
    };
  }

  private async extractFromImage(fileBuffer: Buffer): Promise<ExtractedContent> {
    // Convert image to PNG for better OCR results
    const pngBuffer = await sharp(fileBuffer)
      .png()
      .toBuffer();

    // Perform OCR
    const worker = await createWorker('rus'); // Russian language
    const result = await worker.recognize(pngBuffer);
    await worker.terminate();

    return {
      text: result.data.text,
      metadata: {
        confidence: result.data.confidence,
        ocrEngine: 'tesseract.js',
      },
    };
  }

  private async extractFromText(fileBuffer: Buffer): Promise<ExtractedContent> {
    const text = fileBuffer.toString('utf-8');

    return {
      text,
      metadata: {
        encoding: 'utf-8',
      },
    };
  }

  private splitIntoSentences(text: string): string[] {
    // Split by sentence-ending punctuation, preserving the punctuation
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    return sentences;
  }
}
