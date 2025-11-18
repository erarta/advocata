import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UploadDocumentCommand } from '../../application/commands/upload-document';
import { DeleteDocumentCommand } from '../../application/commands/delete-document';
import { SearchDocumentsQuery } from '../../application/queries/search-documents';
import { GetDocumentQuery } from '../../application/queries/get-document';
import { UploadDocumentDto } from '../dtos/upload-document.dto';
import { SearchDocumentsDto } from '../dtos/search-documents.dto';
import {
  DocumentResponseDto,
  SearchDocumentsResponseDto,
  UploadDocumentResponseDto,
} from '../dtos/document-response.dto';
import { JwtAuthGuard } from '../../../identity/presentation/guards/jwt-auth.guard';
import { DocumentType } from '../../domain/entities/document.entity';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        type: { type: 'string', enum: Object.values(DocumentType) },
        category: { type: 'string' },
        description: { type: 'string' },
        isPublic: { type: 'boolean' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['file', 'title', 'type', 'category'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
    type: UploadDocumentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadDocument(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ): Promise<UploadDocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const lawyerId = req.user.userId;

    const command = new UploadDocumentCommand(
      lawyerId,
      dto.title,
      file.originalname,
      file.buffer,
      file.mimetype,
      dto.type,
      dto.category,
      dto.description,
      dto.isPublic || false,
      dto.tags || [],
      dto.metadata || {},
    );

    const result = await this.commandBus.execute(command);

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return {
      documentId: result.value.documentId,
      fileUrl: result.value.fileUrl,
      message: 'Document uploaded successfully and queued for processing',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Search documents' })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
    type: SearchDocumentsResponseDto,
  })
  async searchDocuments(
    @Request() req,
    @Query() dto: SearchDocumentsDto,
  ): Promise<SearchDocumentsResponseDto> {
    const query = new SearchDocumentsQuery(
      dto.lawyerId,
      dto.type,
      dto.category,
      dto.status,
      dto.isPublic,
      dto.tags,
      dto.searchTerm,
      dto.page,
      dto.limit,
    );

    const result = await this.queryBus.execute(query);

    return {
      documents: result.documents.map((doc) => DocumentResponseDto.fromDomain(doc)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
    type: DocumentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getDocument(@Request() req, @Param('id') id: string): Promise<DocumentResponseDto> {
    const userId = req.user.userId;

    const query = new GetDocumentQuery(id, userId);
    const document = await this.queryBus.execute(query);

    return DocumentResponseDto.fromDomain(document);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized to delete this document' })
  @HttpCode(HttpStatus.OK)
  async deleteDocument(
    @Request() req,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const userId = req.user.userId;

    const command = new DeleteDocumentCommand(id, userId);
    const result = await this.commandBus.execute(command);

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return {
      message: 'Document deleted successfully',
    };
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get document processing status' })
  @ApiResponse({
    status: 200,
    description: 'Processing status retrieved',
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        status: { type: 'string' },
        chunkCount: { type: 'number' },
        processedAt: { type: 'string', format: 'date-time' },
        errorMessage: { type: 'string' },
      },
    },
  })
  async getProcessingStatus(@Request() req, @Param('id') id: string) {
    const userId = req.user.userId;

    const query = new GetDocumentQuery(id, userId);
    const document = await this.queryBus.execute(query);

    return {
      documentId: document.id,
      status: document.status,
      chunkCount: document.chunkCount,
      processedAt: document.processedAt,
      errorMessage: document.errorMessage,
    };
  }
}
