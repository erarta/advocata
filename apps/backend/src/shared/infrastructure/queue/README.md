# BullMQ Queue System Documentation

## Overview

The Advocata backend uses BullMQ for handling asynchronous jobs and background tasks. This document explains how to use the queue system.

## Architecture

```
Queue System
├── Queues (5 total)
│   ├── notifications - Push, SMS, Email notifications
│   ├── payments - Payment processing, refunds, payouts
│   ├── consultations - Reminders, auto-complete, reviews
│   ├── emails - Transactional emails
│   └── analytics - Stats updates, reports
│
├── Processors
│   ├── NotificationProcessor
│   ├── PaymentProcessor
│   ├── ConsultationProcessor
│   ├── EmailProcessor
│   └── AnalyticsProcessor
│
└── Services
    ├── QueueService - Main API for adding jobs
    └── QueueHealthService - Health monitoring
```

## Available Queues

### 1. Notifications Queue
**Queue Name:** `notifications`

Jobs:
- `send-email` - Send individual email
- `send-sms` - Send SMS via Twilio
- `send-push` - Send push notification
- `send-bulk-email` - Send bulk emails

### 2. Payments Queue
**Queue Name:** `payments`

Jobs:
- `process-payment` - Process payment via ЮКасса
- `verify-payment-status` - Check payment status (recurring)
- `process-refund` - Process refund
- `process-payout` - Process lawyer payout
- `subscription-renewal` - Renew subscription
- `payment-reminder` - Send payment reminder

### 3. Consultations Queue
**Queue Name:** `consultations`

Jobs:
- `consultation-reminder` - Send reminder 1h before
- `consultation-start-notification` - Notify at start time
- `consultation-end-processing` - Process after consultation ends
- `auto-complete-consultation` - Auto-complete after 24h
- `request-review` - Request review 1h after completion

### 4. Emails Queue
**Queue Name:** `emails`

Jobs:
- `send-welcome-email` - Welcome new users
- `send-otp-email` - Send OTP code
- `send-consultation-confirmation` - Confirm booking
- `send-payment-receipt` - Send payment receipt
- `send-weekly-digest` - Weekly summary

### 5. Analytics Queue
**Queue Name:** `analytics`

Jobs:
- `update-lawyer-stats` - Update lawyer statistics
- `update-platform-metrics` - Update platform metrics
- `generate-daily-report` - Daily report (2 AM)
- `generate-weekly-report` - Weekly report (Monday 9 AM)

## Usage

### 1. Inject QueueService

```typescript
import { Injectable } from '@nestjs/common';
import { QueueService } from '@/shared/infrastructure/queue/services/queue.service';

@Injectable()
export class YourService {
  constructor(private readonly queueService: QueueService) {}
}
```

### 2. Add Jobs to Queue

#### Simple Job
```typescript
await this.queueService.addEmailJob(
  EMAIL_JOB_TYPES.SEND_WELCOME_EMAIL,
  {
    userId: 'user-123',
    email: 'user@example.com',
    firstName: 'John',
  }
);
```

#### High Priority Job
```typescript
await this.queueService.addCriticalEmailJob(
  EMAIL_JOB_TYPES.SEND_OTP_EMAIL,
  {
    email: 'user@example.com',
    code: '123456',
    expiresAt: new Date(Date.now() + 300000),
  }
);
```

#### Scheduled/Delayed Job
```typescript
await this.queueService.scheduleConsultationJob(
  CONSULTATION_JOB_TYPES.CONSULTATION_REMINDER,
  {
    consultationId: 'cons-123',
    clientId: 'client-123',
    lawyerId: 'lawyer-123',
    scheduledTime: consultationTime,
  },
  3600000 // Delay: 1 hour in milliseconds
);
```

#### Recurring Job
```typescript
await this.queueService.scheduleRecurringJob(
  QUEUE_NAMES.ANALYTICS,
  ANALYTICS_JOB_TYPES.GENERATE_DAILY_REPORT,
  { date: new Date() },
  '0 2 * * *' // Cron: Every day at 2 AM
);
```

### 3. Job Priorities

Jobs are prioritized as follows:

1. **CRITICAL (Priority 1)** - OTP emails, emergency notifications
2. **HIGH (Priority 2)** - Payment confirmations, consultation reminders
3. **NORMAL (Priority 3)** - Welcome emails, newsletters
4. **LOW (Priority 4)** - Analytics, reports

### 4. Retry Logic

All jobs have automatic retry with exponential backoff:

- Default: 3 attempts
- Critical jobs: 5 attempts
- Backoff: 2s → 4s → 8s

### 5. Job Retention

- **Completed jobs:** Kept for 24 hours (payments: 30 days)
- **Failed jobs:** Kept for 7 days (payments: 90 days)

## Integration Examples

See the `/examples` directory for full integration examples:

- `payment-integration.example.ts` - Payment module integration
- `consultation-integration.example.ts` - Consultation module integration
- `email-integration.example.ts` - Email/Identity module integration
- `analytics-integration.example.ts` - Analytics integration

## Monitoring

### Bull Board Dashboard

Access the queue dashboard at: `http://localhost:3000/admin/queues`

Features:
- View all queues and their stats
- Inspect individual jobs
- Retry failed jobs
- Clean old jobs
- Pause/resume queues

### Health Monitoring

#### Check All Queues Health
```bash
GET /admin/queue-management/health
```

Response:
```json
{
  "overall": "healthy",
  "timestamp": "2025-11-23T10:00:00Z",
  "queues": [
    {
      "queueName": "payments",
      "isHealthy": true,
      "status": "healthy",
      "stats": {
        "waiting": 5,
        "active": 2,
        "completed": 1000,
        "failed": 10,
        "delayed": 50
      }
    }
  ]
}
```

#### Get Queue Statistics
```bash
GET /admin/queue-management/stats/payments
```

#### Pause/Resume Queue
```bash
POST /admin/queue-management/payments/pause
POST /admin/queue-management/payments/resume
```

#### Retry Failed Job
```bash
POST /admin/queue-management/payments/jobs/job-123/retry
```

### Automated Health Checks

The system runs automated health checks every 5 minutes and logs:

- **WARNING:** Queue is backed up (>1000 pending jobs)
- **CRITICAL:** High failure rate (>10%) or too many failed jobs (>100)

## Performance Considerations

### Concurrency Settings

Each queue has optimized concurrency:

- **Notifications:** 5 concurrent jobs
- **Payments:** 3 concurrent jobs (careful with payment APIs)
- **Consultations:** 10 concurrent jobs
- **Emails:** 10 concurrent jobs
- **Analytics:** 2 concurrent jobs (resource-intensive)

### Queue Separation

Queues are separated by domain to:
- Prevent one queue from blocking others
- Apply different retry and retention policies
- Scale independently
- Monitor performance per domain

### Redis Connection

All queues share a single Redis connection configured in `app.module.ts`:

```typescript
BullModule.forRoot({
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
})
```

## Adding New Job Types

### 1. Define Job Data Interface

Create in `/jobs/your-domain.jobs.ts`:

```typescript
export interface YourJobData extends BaseJobData {
  // Your fields
}

export const YOUR_JOB_TYPES = {
  YOUR_JOB: 'your-job',
} as const;
```

### 2. Add Processor Handler

Update processor in `/processors/your-domain.processor.ts`:

```typescript
async process(job: Job): Promise<any> {
  switch (job.name) {
    case YOUR_JOB_TYPES.YOUR_JOB:
      return await this.handleYourJob(job);
    // ...
  }
}

private async handleYourJob(job: Job<YourJobData>): Promise<void> {
  // Implementation
}
```

### 3. Add Helper Method (Optional)

Add to `QueueService`:

```typescript
async addYourJob(jobName: string, data: any) {
  return await this.yourQueue.add(jobName, data, DEFAULT_JOB_OPTIONS);
}
```

## Troubleshooting

### Jobs Not Processing

1. Check Redis connection: `redis-cli ping`
2. Check queue processor is registered in `queue.module.ts`
3. Check Bull Board dashboard for errors
4. Review logs for processor errors

### High Failure Rate

1. Check job data validity
2. Review external service availability (Twilio, SendGrid, etc.)
3. Check retry configuration
4. Review error logs in failed jobs

### Queue Backed Up

1. Increase concurrency for the queue
2. Scale Redis if needed
3. Optimize job processing time
4. Consider rate limiting job additions

## Environment Variables

```bash
# BullMQ Configuration
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=
QUEUE_CONCURRENCY=5
QUEUE_MAX_RETRIES=3
QUEUE_ENABLE_DASHBOARD=true
```

## Best Practices

1. **Always use job types constants** - Don't hardcode job names
2. **Include timestamp in job data** - For debugging and analytics
3. **Use appropriate priorities** - Don't overuse CRITICAL priority
4. **Handle errors gracefully** - Let jobs fail and retry naturally
5. **Monitor queue health** - Set up alerts for critical issues
6. **Clean old jobs regularly** - Use the clean endpoint
7. **Test job processors** - Write unit tests for processors
8. **Use delays for scheduled tasks** - Don't poll in processors

## Testing

### Unit Testing Processors

```typescript
describe('PaymentProcessor', () => {
  let processor: PaymentProcessor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PaymentProcessor],
    }).compile();

    processor = module.get<PaymentProcessor>(PaymentProcessor);
  });

  it('should process payment job', async () => {
    const job = {
      id: 'job-123',
      name: PAYMENT_JOB_TYPES.PROCESS_PAYMENT,
      data: { paymentId: 'pay-123' },
      attemptsMade: 0,
      opts: { attempts: 3 },
    } as Job;

    await expect(processor.process(job)).resolves.not.toThrow();
  });
});
```

## Related Documentation

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Bull Board Documentation](https://github.com/felixmosh/bull-board)
- [Redis Documentation](https://redis.io/docs/)

---

**Version:** 1.0
**Last Updated:** November 23, 2025
**Maintainer:** Advocata Backend Team
