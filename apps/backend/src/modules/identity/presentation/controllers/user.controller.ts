import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { GetUserByIdQuery } from '../../application/queries/get-user-by-id';
import { UserDto } from '../../application/queries/get-user-by-id/user.dto';

/**
 * UserController
 *
 * Handles user profile endpoints
 */
@ApiTags('identity')
@Controller('users')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found',
    type: UserDto,
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    const query = new GetUserByIdQuery(id);
    const result = await this.queryBus.execute(query);

    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }

    return result.value;
  }
}
