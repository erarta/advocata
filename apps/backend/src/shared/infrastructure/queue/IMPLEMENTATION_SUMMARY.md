# BullMQ Queue System Implementation Summary

## Overview

A comprehensive BullMQ job queue system has been successfully implemented for the Advocata backend, providing robust asynchronous task processing across all domains.

---

## 📁 Files Created

### Core Infrastructure

```
apps/backend/src/shared/infrastructure/queue/
├── queue.module.ts                    # Main queue module (Global)
├── bull-board.module.ts               # Bull Board monitoring setup
├── README.md                          # Comprehensive documentation
├── IMPLEMENTATION_SUMMARY.md          # This file
│
├── interfaces/
│   └── job-options.interface.ts       # Job priorities, options, constants
│
├── jobs/
│   ├── notification.jobs.ts           # Notification job types & data
│   ├── payment.jobs.ts                # Payment job types & data
│   ├── consultation.jobs.ts           # Consultation job types & data
│   ├── email.jobs.ts                  # Email job types & data
│   └── analytics.jobs.ts              # Analytics job types & data
│
├── processors/
│   ├── notification.processor.ts      # Notification job processor
│   ├── payment.processor.ts           # Payment job processor
│   ├── consultation.processor.ts      # Consultation job processor
│   ├── email.processor.ts             # Email job processor
│   └── analytics.processor.ts         # Analytics job processor
│
├── services/
│   ├── queue.service.ts               # Main queue service API
│   └── queue-health.service.ts        # Health monitoring service
│
├── controllers/
│   └── queue-health.controller.ts     # Admin queue management API
│
└── examples/
    ├── payment-integration.example.ts       # Payment module integration
    ├── consultation-integration.example.ts  # Consultation module integration
    ├── email-integration.example.ts         # Email/Identity integration
    └── analytics-integration.example.ts     # Analytics integration
```

### Modified Files

- `apps/backend/src/app.module.ts` - Added QueueModule import
- `apps/backend/.env.example` - Added queue configuration
- `apps/backend/package.json` - Added Bull Board dependencies

---

## ✅ Queues Created (5 Total)

### 1. Notifications Queue (`notifications`)
**Purpose:** Handle all notification types (email, SMS, push)

**Jobs:**
- `send-email` - Send individual email notification
- `send-sms` - Send SMS via Twilio
- `send-push` - Send push notification via FCM
- `send-bulk-email` - Send bulk emails (batch processing)

**Configuration:**
- Concurrency: 5
- Retention: 24h completed, 7d failed
- Default retries: 3

### 2. Payments Queue (`payments`)
**Purpose:** Process payments, refunds, and payouts

**Jobs:**
- `process-payment` - Process payment via ЮКасса
- `verify-payment-status` - Verify payment status (recurring)
- `process-refund` - Process refund request
- `process-payout` - Process lawyer payout
- `subscription-renewal` - Renew subscription
- `payment-reminder` - Send payment reminder

**Configuration:**
- Concurrency: 3 (limited for payment API safety)
- Retention: 30d completed, 90d failed (compliance)
- Default retries: 3-5

### 3. Consultations Queue (`consultations`)
**Purpose:** Handle consultation lifecycle tasks

**Jobs:**
- `consultation-reminder` - Remind client/lawyer 1h before
- `consultation-start-notification` - Notify at start time
- `consultation-end-processing` - Process after consultation ends
- `auto-complete-consultation` - Auto-complete after 24h
- `request-review` - Request review 1h after completion

**Configuration:**
- Concurrency: 10
- Retention: 24h completed, 7d failed
- Default retries: 3

### 4. Emails Queue (`emails`)
**Purpose:** Transactional emails

**Jobs:**
- `send-welcome-email` - Welcome new users
- `send-otp-email` - Send OTP code (CRITICAL priority)
- `send-consultation-confirmation` - Confirm booking
- `send-payment-receipt` - Send payment receipt
- `send-weekly-digest` - Weekly summary (recurring)

**Configuration:**
- Concurrency: 10
- Retention: 24h completed, 7d failed
- Default retries: 3-5 (OTP critical)

### 5. Analytics Queue (`analytics`)
**Purpose:** Statistics and reporting

**Jobs:**
- `update-lawyer-stats` - Update lawyer statistics
- `update-platform-metrics` - Update platform metrics
- `generate-daily-report` - Generate daily report (2 AM cron)
- `generate-weekly-report` - Generate weekly report (Monday 9 AM)

**Configuration:**
- Concurrency: 2 (resource-intensive)
- Retention: 7d completed, 30d failed
- Default retries: 2

---

## 🎯 Job Priorities

Jobs are automatically prioritized:

1. **CRITICAL (1)** - OTP emails, emergency notifications
2. **HIGH (2)** - Payment confirmations, consultation reminders
3. **NORMAL (3)** - Welcome emails, standard notifications
4. **LOW (4)** - Analytics, reports, background tasks

---

## 🔄 Retry Logic

All jobs have exponential backoff retry:

- **Default:** 3 attempts (2s → 4s → 8s delays)
- **Critical:** 5 attempts (1s → 2s → 4s → 8s → 16s)
- **Low Priority:** 2 attempts
- **Payment:** 4 attempts (financial operations)

---

## 📊 Monitoring & Management

### Bull Board Dashboard
**URL:** `http://localhost:3000/admin/queues`

**Features:**
- View all 5 queues and their stats
- Inspect individual jobs
- Retry failed jobs
- Remove jobs
- Pause/resume queues
- Real-time updates

### Queue Health API

#### Get Health Report
```bash
GET /admin/queue-management/health
```

Returns overall health status and per-queue metrics:
- Waiting jobs count
- Active jobs count
- Completed jobs count
- Failed jobs count
- Delayed jobs count

#### Queue Statistics
```bash
GET /admin/queue-management/stats
GET /admin/queue-management/stats/:queueName
```

#### Queue Control
```bash
POST /admin/queue-management/:queueName/pause
POST /admin/queue-management/:queueName/resume
DELETE /admin/queue-management/:queueName/clean
```

#### Job Management
```bash
POST /admin/queue-management/:queueName/jobs/:jobId/retry
DELETE /admin/queue-management/:queueName/jobs/:jobId
```

### Automated Health Monitoring

The `QueueHealthService` runs every 5 minutes and checks:

- **WARNING** if queue has >1000 pending jobs (backed up)
- **CRITICAL** if failure rate >10%
- **CRITICAL** if >100 failed jobs

Logs are generated for all health issues.

---

## 🔌 Integration Points

### Payment Module
```typescript
// In PaymentService
constructor(private queueService: QueueService) {}

async createPayment(data: CreatePaymentDto) {
  const payment = await this.paymentRepository.create(data);

  // Queue payment processing
  await this.queueService.addPaymentJobWithHighPriority(
    PAYMENT_JOB_TYPES.PROCESS_PAYMENT,
    { paymentId: payment.id }
  );

  return payment;
}
```

### Consultation Module
```typescript
// In ConsultationService
constructor(private queueService: QueueService) {}

async bookConsultation(data: BookConsultationDto) {
  const consultation = await this.consultationRepository.create(data);

  // Schedule reminder 1 hour before
  const delay = scheduledTime.getTime() - Date.now() - 3600000;
  await this.queueService.scheduleConsultationJob(
    CONSULTATION_JOB_TYPES.CONSULTATION_REMINDER,
    {
      consultationId: consultation.id,
      clientId: data.clientId,
      lawyerId: data.lawyerId,
      scheduledTime: data.scheduledTime,
    },
    delay
  );

  return consultation;
}
```

### Identity Module
```typescript
// In IdentityService
constructor(private queueService: QueueService) {}

async registerUser(data: RegisterDto) {
  const user = await this.userRepository.create(data);

  // Send welcome email
  await this.queueService.addEmailJob(
    EMAIL_JOB_TYPES.SEND_WELCOME_EMAIL,
    {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
    }
  );

  return user;
}
```

See `/examples` directory for complete integration examples.

---

## 📦 Dependencies Installed

```json
{
  "@bull-board/api": "^5.x",
  "@bull-board/nestjs": "^5.x",
  "@bull-board/express": "^5.x"
}
```

BullMQ and @nestjs/bullmq were already installed.

---

## 🔧 Configuration

### Environment Variables (.env.example updated)

```bash
# BullMQ Queue Configuration
QUEUE_REDIS_HOST=localhost
QUEUE_REDIS_PORT=6379
QUEUE_REDIS_PASSWORD=
QUEUE_CONCURRENCY=5
QUEUE_MAX_RETRIES=3
QUEUE_ENABLE_DASHBOARD=true
```

### Redis Connection

Uses the same Redis instance as configured in `app.module.ts`:

```typescript
BullModule.forRoot({
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
})
```

---

## 🚀 How to Use

### 1. Add Job to Queue

```typescript
import { Injectable } from '@nestjs/common';
import { QueueService } from '@/shared/infrastructure/queue/services/queue.service';
import { EMAIL_JOB_TYPES } from '@/shared/infrastructure/queue/jobs/email.jobs';

@Injectable()
export class YourService {
  constructor(private queueService: QueueService) {}

  async someMethod() {
    await this.queueService.addEmailJob(
      EMAIL_JOB_TYPES.SEND_WELCOME_EMAIL,
      {
        userId: 'user-123',
        email: 'user@example.com',
        firstName: 'John',
      }
    );
  }
}
```

### 2. Schedule Delayed Job

```typescript
// Schedule job to run in 1 hour
await this.queueService.scheduleConsultationJob(
  CONSULTATION_JOB_TYPES.CONSULTATION_REMINDER,
  jobData,
  3600000 // 1 hour in milliseconds
);
```

### 3. Add Recurring Job

```typescript
await this.queueService.scheduleRecurringJob(
  QUEUE_NAMES.ANALYTICS,
  ANALYTICS_JOB_TYPES.GENERATE_DAILY_REPORT,
  { date: new Date() },
  '0 2 * * *' // Every day at 2 AM
);
```

---

## ✨ Features Implemented

- ✅ 5 domain-specific queues
- ✅ 24 job types across all queues
- ✅ Job priorities (CRITICAL, HIGH, NORMAL, LOW)
- ✅ Automatic retry with exponential backoff
- ✅ Bull Board monitoring dashboard
- ✅ Health monitoring API
- ✅ Automated health checks (every 5 minutes)
- ✅ Queue management API (pause, resume, clean)
- ✅ Job management (retry, remove)
- ✅ Scheduled/delayed jobs
- ✅ Recurring jobs (cron)
- ✅ Job progress tracking
- ✅ Comprehensive logging
- ✅ Type-safe job data interfaces
- ✅ Global QueueModule (injected everywhere)
- ✅ Integration examples for all modules
- ✅ Complete documentation

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Testing Processors

Example test structure:

```typescript
describe('PaymentProcessor', () => {
  let processor: PaymentProcessor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PaymentProcessor],
    }).compile();

    processor = module.get(PaymentProcessor);
  });

  it('should process payment job', async () => {
    const job = createMockJob({
      name: PAYMENT_JOB_TYPES.PROCESS_PAYMENT,
      data: { paymentId: 'pay-123' },
    });

    await expect(processor.process(job)).resolves.not.toThrow();
  });
});
```

---

## 📖 Documentation

### Primary Documentation
- `/README.md` - Complete usage guide
- `/IMPLEMENTATION_SUMMARY.md` - This file

### Integration Examples
- `/examples/payment-integration.example.ts`
- `/examples/consultation-integration.example.ts`
- `/examples/email-integration.example.ts`
- `/examples/analytics-integration.example.ts`

### External Resources
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Bull Board GitHub](https://github.com/felixmosh/bull-board)
- [NestJS BullMQ](https://docs.nestjs.com/techniques/queues)

---

## 🎯 Next Steps / TODO

### Implementation Needed

The processors are set up with TODO comments where actual service integration is needed:

1. **NotificationProcessor**
   - Integrate with SendGrid for emails
   - Integrate with Twilio for SMS
   - Integrate with Firebase Cloud Messaging for push notifications

2. **PaymentProcessor**
   - Integrate with ЮКасса API
   - Implement payment verification logic
   - Implement refund processing
   - Implement payout calculations

3. **ConsultationProcessor**
   - Integrate with Consultation domain services
   - Implement notification sending via NotificationQueue
   - Implement consultation completion logic

4. **EmailProcessor**
   - Integrate with SendGrid
   - Create email templates
   - Implement OTP email sending
   - Implement receipt generation

5. **AnalyticsProcessor**
   - Implement statistics calculation
   - Implement report generation
   - Integrate with database for metrics

### Module Integration

Update the following modules to use QueueService:

1. **PaymentModule** (`/modules/payment`)
   - Inject QueueService
   - Queue payment processing after creation
   - Queue payment verification
   - Queue payment reminders

2. **ConsultationModule** (`/modules/consultation`)
   - Inject QueueService
   - Schedule reminders after booking
   - Queue end processing
   - Request reviews

3. **IdentityModule** (`/modules/identity`)
   - Inject QueueService
   - Send welcome emails
   - Send OTP emails

4. **NotificationModule** (`/modules/notification`)
   - Integrate with queue processors
   - Use queues for all notification sending

### Testing

- Write unit tests for all processors
- Write integration tests for queue service
- Write E2E tests for critical flows
- Test job retry behavior
- Test health monitoring

### Production Readiness

- Set up Redis cluster for high availability
- Configure queue monitoring alerts
- Set up log aggregation (e.g., ELK stack)
- Implement admin authentication for queue endpoints
- Configure rate limiting for job additions
- Set up metrics collection (Prometheus)

---

## 🏆 Performance Characteristics

### Queue Separation Benefits

1. **Isolation** - One queue failure doesn't affect others
2. **Prioritization** - Critical jobs (payments) get resources
3. **Scalability** - Can scale queues independently
4. **Monitoring** - Per-queue metrics and health checks

### Concurrency Tuning

- **Notifications:** 5 concurrent (I/O bound)
- **Payments:** 3 concurrent (API rate limits)
- **Consultations:** 10 concurrent (high volume)
- **Emails:** 10 concurrent (I/O bound)
- **Analytics:** 2 concurrent (CPU intensive)

### Job Retention

Keeps completed jobs for debugging while managing storage:

- **Short retention (24h):** Notifications, Emails, Consultations
- **Medium retention (7d):** Analytics
- **Long retention (30d):** Payments (compliance)

### Failed Job Retention

Failed jobs kept longer for debugging:

- **Standard (7d):** Most queues
- **Extended (30d):** Analytics
- **Compliance (90d):** Payments

---

## 🔒 Security Considerations

1. **Queue Dashboard** - Protected by admin authentication (TODO: implement)
2. **Job Data** - Never log sensitive data (passwords, tokens)
3. **Redis Connection** - Use password in production
4. **Rate Limiting** - Implement for job additions (TODO)
5. **Data Validation** - Validate job data in processors

---

## 📝 Change Log

### Version 1.0.0 - November 23, 2025

**Initial Implementation**

- Created 5 domain-specific queues
- Implemented 5 processors with 24 job types
- Added Bull Board monitoring dashboard
- Implemented health monitoring service
- Created queue management API
- Added integration examples
- Wrote comprehensive documentation
- Updated environment configuration

---

## 👥 Maintainers

**Advocata Backend Team**
- Email: modera@erarta.ai, evgeniy@erarta.ai
- Repository: https://github.com/erarta/advocata

---

## 📄 License

Proprietary - Advocata Platform

---

**Status:** ✅ Complete - Ready for Integration
**Version:** 1.0.0
**Last Updated:** November 23, 2025
