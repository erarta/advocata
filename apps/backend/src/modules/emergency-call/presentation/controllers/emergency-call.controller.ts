import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateEmergencyCallDto } from '../dtos/create-emergency-call.dto';
import { EmergencyCallResponseDto } from '../dtos/emergency-call-response.dto';
import { CreateEmergencyCallCommand } from '../../application/commands/create-emergency-call/create-emergency-call.command';

/**
 * Emergency Call Controller
 * REST endpoints for emergency call operations
 */
@ApiTags('Emergency Calls')
@ApiBearerAuth()
@Controller('api/v1/emergency-calls')
export class EmergencyCallController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Creates a new emergency call
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create emergency call' })
  @ApiResponse({
    status: 201,
    description: 'Emergency call created successfully',
    type: EmergencyCallResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() dto: CreateEmergencyCallDto,
  ): Promise<EmergencyCallResponseDto> {
    const command = new CreateEmergencyCallCommand(
      dto.userId,
      dto.latitude,
      dto.longitude,
      dto.address,
      dto.notes,
    );

    const emergencyCall = await this.commandBus.execute(command);

    return this.mapToDto(emergencyCall);
  }

  /**
   * Gets an emergency call by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get emergency call by ID' })
  @ApiResponse({
    status: 200,
    description: 'Emergency call found',
    type: EmergencyCallResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Emergency call not found' })
  async getById(@Param('id') id: string): Promise<EmergencyCallResponseDto> {
    // TODO: Implement GetEmergencyCallQuery
    throw new Error('Not implemented');
  }

  /**
   * Gets nearby lawyers for a location
   */
  @Get('nearby-lawyers')
  @ApiOperation({ summary: 'Find nearby lawyers' })
  @ApiResponse({
    status: 200,
    description: 'List of nearby lawyers',
  })
  async getNearbyLawyers(
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Query('radius') radius: number = 10000,
  ): Promise<any[]> {
    // TODO: Implement FindNearbyLawyersQuery
    throw new Error('Not implemented');
  }

  /**
   * Maps domain entity to DTO
   */
  private mapToDto(entity: any): EmergencyCallResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      lawyerId: entity.lawyerId,
      latitude: entity.location.latitude,
      longitude: entity.location.longitude,
      address: entity.address,
      status: entity.status.toString(),
      notes: entity.notes,
      createdAt: entity.createdAt,
      acceptedAt: entity.acceptedAt,
      completedAt: entity.completedAt,
    };
  }
}
