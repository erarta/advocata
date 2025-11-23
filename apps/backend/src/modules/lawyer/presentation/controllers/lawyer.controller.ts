import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { RegisterLawyerCommand } from '../../application/commands/register-lawyer/register-lawyer.command';
import { SearchLawyersQuery } from '../../application/queries/search-lawyers/search-lawyers.query';
import { RegisterLawyerRequestDto } from '../dtos/register-lawyer.request.dto';
import { SearchLawyersRequestDto } from '../dtos/search-lawyers.request.dto';
import {
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  CacheInvalidate,
} from '../../../../shared/infrastructure/cache';

/**
 * LawyerController
 *
 * Handles lawyer-related endpoints
 */
@ApiTags('lawyers')
@Controller('lawyers')
@UseInterceptors(CacheInterceptor)
export class LawyerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new lawyer' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lawyer successfully registered',
  })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  @CacheInvalidate(['lawyers:search:*', 'lawyers:all'])
  async register(@Body() dto: RegisterLawyerRequestDto) {
    const command = new RegisterLawyerCommand(
      dto.userId,
      dto.licenseNumber,
      dto.specializations,
      dto.experienceYears,
      dto.bio,
      dto.education,
      dto.hourlyRate,
    );

    const result = await this.commandBus.execute(command);

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return result.value;
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search lawyers' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lawyers found',
  })
  @CacheKey((req) => `lawyers:search:${JSON.stringify(req.query)}`)
  @CacheTTL(300) // 5 minutes
  async search(@Query() dto: SearchLawyersRequestDto) {
    const query = new SearchLawyersQuery(
      dto.specializations,
      dto.minRating,
      dto.minExperience,
      dto.isAvailable,
      dto.limit,
      dto.offset,
    );

    return await this.queryBus.execute(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get lawyer by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lawyer found',
  })
  @CacheKey((req) => `lawyer:${req.params.id}`)
  @CacheTTL(600) // 10 minutes
  async getById(@Param('id') id: string) {
    // Simplified - would use GetLawyerByIdQuery
    return { message: 'Get lawyer by ID - to be implemented' };
  }
}
