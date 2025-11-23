import { Controller, Get, Param, Post, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueueService } from '../services/queue.service';
import { QueueHealthService } from '../services/queue-health.service';

// TODO: Implement proper admin authentication guard
// import { AdminGuard } from '@/modules/identity/presentation/guards/admin.guard';

@ApiTags('Queue Management')
@Controller('admin/queue-management')
// @UseGuards(AdminGuard) // Uncomment when admin auth is implemented
export class QueueHealthController {
  constructor(
    private readonly queueService: QueueService,
    private readonly queueHealthService: QueueHealthService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Get health status of all queues' })
  @ApiResponse({ status: 200, description: 'Queue health report' })
  async getHealthReport() {
    return await this.queueHealthService.getHealthReport();
  }

  @Get('health/:queueName')
  @ApiOperation({ summary: 'Get health status of a specific queue' })
  @ApiResponse({ status: 200, description: 'Queue health status' })
  async getQueueHealth(@Param('queueName') queueName: string) {
    return await this.queueHealthService.checkQueueHealth(queueName);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get statistics for all queues' })
  @ApiResponse({ status: 200, description: 'All queue statistics' })
  async getAllStats() {
    return await this.queueService.getAllQueueStats();
  }

  @Get('stats/:queueName')
  @ApiOperation({ summary: 'Get statistics for a specific queue' })
  @ApiResponse({ status: 200, description: 'Queue statistics' })
  async getQueueStats(@Param('queueName') queueName: string) {
    return await this.queueService.getQueueStats(queueName);
  }

  @Post(':queueName/pause')
  @ApiOperation({ summary: 'Pause a queue' })
  @ApiResponse({ status: 200, description: 'Queue paused successfully' })
  async pauseQueue(@Param('queueName') queueName: string) {
    await this.queueService.pauseQueue(queueName);
    return { message: `Queue ${queueName} paused successfully` };
  }

  @Post(':queueName/resume')
  @ApiOperation({ summary: 'Resume a paused queue' })
  @ApiResponse({ status: 200, description: 'Queue resumed successfully' })
  async resumeQueue(@Param('queueName') queueName: string) {
    await this.queueService.resumeQueue(queueName);
    return { message: `Queue ${queueName} resumed successfully` };
  }

  @Delete(':queueName/clean')
  @ApiOperation({ summary: 'Clean completed and failed jobs from a queue' })
  @ApiResponse({ status: 200, description: 'Queue cleaned successfully' })
  async cleanQueue(@Param('queueName') queueName: string) {
    await this.queueService.cleanQueue(queueName);
    return { message: `Queue ${queueName} cleaned successfully` };
  }

  @Post(':queueName/jobs/:jobId/retry')
  @ApiOperation({ summary: 'Retry a failed job' })
  @ApiResponse({ status: 200, description: 'Job retried successfully' })
  async retryJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    await this.queueService.retryFailedJob(queueName, jobId);
    return { message: `Job ${jobId} retried successfully` };
  }

  @Delete(':queueName/jobs/:jobId')
  @ApiOperation({ summary: 'Remove a job from queue' })
  @ApiResponse({ status: 200, description: 'Job removed successfully' })
  async removeJob(
    @Param('queueName') queueName: string,
    @Param('jobId') jobId: string,
  ) {
    await this.queueService.removeJob(queueName, jobId);
    return { message: `Job ${jobId} removed successfully` };
  }
}
