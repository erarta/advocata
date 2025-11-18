import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BookConsultationCommand } from '../../application/commands/book-consultation/book-consultation.command';
import { ConfirmConsultationCommand } from '../../application/commands/confirm-consultation/confirm-consultation.command';
import { StartConsultationCommand } from '../../application/commands/start-consultation/start-consultation.command';
import { CompleteConsultationCommand } from '../../application/commands/complete-consultation/complete-consultation.command';
import { CancelConsultationCommand } from '../../application/commands/cancel-consultation/cancel-consultation.command';
import { RateConsultationCommand } from '../../application/commands/rate-consultation/rate-consultation.command';
import { GetUserConsultationsQuery } from '../../application/queries/get-user-consultations/get-user-consultations.query';
import { GetLawyerConsultationsQuery } from '../../application/queries/get-lawyer-consultations/get-lawyer-consultations.query';
import { GetConsultationByIdQuery } from '../../application/queries/get-consultation-by-id/get-consultation-by-id.query';
import { GetActiveConsultationQuery } from '../../application/queries/get-active-consultation/get-active-consultation.query';
import { BookConsultationRequestDto } from '../dtos/book-consultation.request.dto';
import { CancelConsultationRequestDto } from '../dtos/cancel-consultation.request.dto';
import { RateConsultationRequestDto } from '../dtos/rate-consultation.request.dto';
import { ConsultationResponseDto } from '../dtos/consultation.response.dto';
import { ConsultationStatus } from '../../domain/enums';

/**
 * Consultation Controller
 *
 * Handles consultation-related endpoints
 */
@ApiTags('consultations')
@Controller('api/v1/consultations')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // TODO: Uncomment when auth is implemented
export class ConsultationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Book a new consultation
   * POST /api/v1/consultations
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book a new consultation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Consultation successfully booked',
    type: ConsultationResponseDto,
  })
  async bookConsultation(
    @Body() dto: BookConsultationRequestDto,
  ): Promise<ConsultationResponseDto> {
    const command = new BookConsultationCommand(
      dto.clientId,
      dto.lawyerId,
      dto.type,
      dto.description,
      dto.scheduledStart ? new Date(dto.scheduledStart) : undefined,
      dto.scheduledEnd ? new Date(dto.scheduledEnd) : undefined,
    );

    return await this.commandBus.execute(command);
  }

  /**
   * Get user's consultations
   * GET /api/v1/consultations/my
   */
  @Get('my')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user consultations' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ConsultationStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User consultations',
  })
  async getUserConsultations(
    @Query('status') status?: ConsultationStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    // @Request() req, // TODO: Get userId from JWT token
  ): Promise<any> {
    // TODO: Get userId from authenticated user
    const userId = 'temp-user-id'; // Placeholder

    const query = new GetUserConsultationsQuery(
      userId,
      status,
      limit,
      offset,
    );

    return await this.queryBus.execute(query);
  }

  /**
   * Get lawyer's consultations
   * GET /api/v1/consultations/lawyer/:lawyerId
   */
  @Get('lawyer/:lawyerId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get lawyer consultations' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ConsultationStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lawyer consultations',
  })
  async getLawyerConsultations(
    @Param('lawyerId') lawyerId: string,
    @Query('status') status?: ConsultationStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<any> {
    const query = new GetLawyerConsultationsQuery(
      lawyerId,
      status,
      limit,
      offset,
    );

    return await this.queryBus.execute(query);
  }

  /**
   * Get active consultation
   * GET /api/v1/consultations/active
   */
  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active consultation for current user' })
  @ApiQuery({
    name: 'isLawyer',
    required: false,
    type: Boolean,
    description: 'Is user a lawyer',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active consultation or null',
    type: ConsultationResponseDto,
  })
  async getActiveConsultation(
    @Query('isLawyer') isLawyer?: boolean,
    // @Request() req, // TODO: Get userId from JWT token
  ): Promise<ConsultationResponseDto | null> {
    // TODO: Get userId from authenticated user
    const userId = 'temp-user-id'; // Placeholder

    const query = new GetActiveConsultationQuery(userId, isLawyer || false);

    return await this.queryBus.execute(query);
  }

  /**
   * Get consultation by ID
   * GET /api/v1/consultations/:id
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get consultation by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation found',
    type: ConsultationResponseDto,
  })
  async getConsultationById(
    @Param('id') id: string,
    // @Request() req, // TODO: Get userId from JWT token
  ): Promise<ConsultationResponseDto> {
    // TODO: Get userId from authenticated user
    const userId = 'temp-user-id'; // Placeholder

    const query = new GetConsultationByIdQuery(id, userId);

    return await this.queryBus.execute(query);
  }

  /**
   * Confirm consultation (by lawyer)
   * POST /api/v1/consultations/:id/confirm
   */
  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm consultation (lawyer only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation confirmed',
  })
  async confirmConsultation(
    @Param('id') id: string,
    // @Request() req, // TODO: Get lawyerId from JWT token
  ): Promise<any> {
    // TODO: Get lawyerId from authenticated user
    const lawyerId = 'temp-lawyer-id'; // Placeholder

    const command = new ConfirmConsultationCommand(id, lawyerId);

    return await this.commandBus.execute(command);
  }

  /**
   * Start consultation
   * POST /api/v1/consultations/:id/start
   */
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start consultation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation started',
  })
  async startConsultation(
    @Param('id') id: string,
    // @Request() req, // TODO: Get userId from JWT token
  ): Promise<any> {
    // TODO: Get userId from authenticated user
    const userId = 'temp-user-id'; // Placeholder

    const command = new StartConsultationCommand(id, userId);

    return await this.commandBus.execute(command);
  }

  /**
   * Complete consultation
   * POST /api/v1/consultations/:id/complete
   */
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete consultation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation completed',
  })
  async completeConsultation(
    @Param('id') id: string,
    // @Request() req, // TODO: Get userId from JWT token
  ): Promise<any> {
    // TODO: Get userId from authenticated user
    const userId = 'temp-user-id'; // Placeholder

    const command = new CompleteConsultationCommand(id, userId);

    return await this.commandBus.execute(command);
  }

  /**
   * Cancel consultation
   * POST /api/v1/consultations/:id/cancel
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel consultation' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation cancelled',
  })
  async cancelConsultation(
    @Param('id') id: string,
    @Body() dto: CancelConsultationRequestDto,
    // @Request() req, // TODO: Get userId from JWT token
  ): Promise<any> {
    // TODO: Get userId from authenticated user
    const userId = 'temp-user-id'; // Placeholder

    const command = new CancelConsultationCommand(
      id,
      userId,
      dto.cancellationReason,
    );

    return await this.commandBus.execute(command);
  }

  /**
   * Rate consultation
   * POST /api/v1/consultations/:id/rate
   */
  @Post(':id/rate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rate consultation (client only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Consultation rated',
  })
  async rateConsultation(
    @Param('id') id: string,
    @Body() dto: RateConsultationRequestDto,
    // @Request() req, // TODO: Get clientId from JWT token
  ): Promise<any> {
    // TODO: Get clientId from authenticated user
    const clientId = 'temp-client-id'; // Placeholder

    const command = new RateConsultationCommand(
      id,
      clientId,
      dto.rating,
      dto.review,
    );

    return await this.commandBus.execute(command);
  }
}
