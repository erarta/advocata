import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../infrastructure/guards/admin-auth.guard';
import { AdminRoles } from '../../infrastructure/decorators/admin-roles.decorator';

// Import DTOs
import {
  GetUsersDto,
  UpdateUserDto,
  SuspendUserDto,
  BanUserDto,
} from '../dtos/users';

// Import Queries
import { GetUsersQuery } from '../../application/queries/users/get-users';
import { GetUserQuery } from '../../application/queries/users/get-user';
import { GetUserStatsQuery } from '../../application/queries/users/get-user-stats';
import { GetUserActivityQuery } from '../../application/queries/users/get-user-activity';

// Import Commands
import { UpdateUserCommand } from '../../application/commands/users/update-user';
import { SuspendUserCommand } from '../../application/commands/users/suspend-user';
import { BanUserCommand } from '../../application/commands/users/ban-user';
import { ActivateUserCommand } from '../../application/commands/users/activate-user';
import { DeleteUserCommand } from '../../application/commands/users/delete-user';

@ApiTags('admin/users')
@Controller('admin/users')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
@AdminRoles('admin', 'super_admin', 'support')
export class AdminUsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(@Query() dto: GetUsersDto) {
    return this.queryBus.execute(new GetUsersQuery(dto));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User stats retrieved successfully' })
  async getUserStats() {
    return this.queryBus.execute(new GetUserStatsQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get user activity log' })
  @ApiResponse({ status: 200, description: 'Activity log retrieved successfully' })
  async getUserActivity(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.queryBus.execute(new GetUserActivityQuery(id, limit));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, dto));
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend user account' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  @HttpCode(HttpStatus.OK)
  async suspendUser(@Param('id') id: string, @Body() dto: SuspendUserDto) {
    return this.commandBus.execute(new SuspendUserCommand(id, dto));
  }

  @Post(':id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend user account (activate)' })
  @ApiResponse({ status: 200, description: 'User unsuspended successfully' })
  @HttpCode(HttpStatus.OK)
  async unsuspendUser(
    @Param('id') id: string,
    @Body() body?: { notes?: string },
  ) {
    return this.commandBus.execute(new ActivateUserCommand(id, body?.notes));
  }

  @Post(':id/ban')
  @ApiOperation({ summary: 'Ban user account permanently' })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @AdminRoles('super_admin')
  @HttpCode(HttpStatus.OK)
  async banUser(@Param('id') id: string, @Body() dto: BanUserDto) {
    return this.commandBus.execute(new BanUserCommand(id, dto));
  }

  @Post(':id/unban')
  @ApiOperation({ summary: 'Unban user account (activate)' })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @AdminRoles('super_admin')
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('id') id: string, @Body() body?: { notes?: string }) {
    return this.commandBus.execute(new ActivateUserCommand(id, body?.notes));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user account (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @AdminRoles('super_admin')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
