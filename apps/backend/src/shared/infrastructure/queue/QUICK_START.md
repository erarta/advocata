# BullMQ Queue System - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Verify Installation

```bash
cd apps/backend
npm install  # Bull Board packages already installed
```

### 2. Start Redis (if not running)

```bash
# Using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or using local Redis
redis-server
```

### 3. Start Backend

```bash
npm run start:dev
```

### 4. Access Bull Board Dashboard

Open in browser: `http://localhost:3000/admin/queues`

You should see 5 queues:
- notifications
- payments
- consultations
- emails
- analytics

---

## 📝 Basic Usage

### Add Your First Job

```typescript
import { Injectable } from '@nestjs/common';
import { QueueService } from '@/shared/infrastructure/queue/services/queue.service';
import { EMAIL_JOB_TYPES } from '@/shared/infrastructure/queue/jobs/email.jobs';

@Injectable()
export class UserService {
  constructor(private queueService: QueueService) {}

  async createUser(email: string, firstName: string) {
    // Your user creation logic...

    // Add welcome email job
    await this.queueService.addEmailJob(
      EMAIL_JOB_TYPES.SEND_WELCOME_EMAIL,
      {
        userId: user.id,
        email: email,
        firstName: firstName,
      }
    );
  }
}
```

### Schedule a Delayed Job

```typescript
// Send reminder 1 hour before consultation
const oneHourBefore = consultationTime.getTime() - Date.now() - 3600000;

await this.queueService.scheduleConsultationJob(
  CONSULTATION_JOB_TYPES.CONSULTATION_REMINDER,
  {
    consultationId: consultation.id,
    clientId: client.id,
    lawyerId: lawyer.id,
    scheduledTime: consultationTime,
  },
  oneHourBefore  // delay in milliseconds
);
```

### Check Queue Health

```bash
# Get health status
curl http://localhost:3000/admin/queue-management/health

# Get specific queue stats
curl http://localhost:3000/admin/queue-management/stats/payments
```

---

## 🔧 Common Tasks

### Retry a Failed Job

Via API:
```bash
POST http://localhost:3000/admin/queue-management/payments/jobs/{jobId}/retry
```

Via Bull Board:
1. Go to `http://localhost:3000/admin/queues`
2. Click on the queue
3. Navigate to "Failed" tab
4. Click retry on the job

### Pause a Queue

```bash
POST http://localhost:3000/admin/queue-management/payments/pause
```

### Clean Old Jobs

```bash
DELETE http://localhost:3000/admin/queue-management/payments/clean
```

---

## 🎯 Integration Checklist

To integrate queues into your module:

- [ ] Import QueueService in your service/handler
- [ ] Choose appropriate queue (payments, emails, etc.)
- [ ] Choose job type from constants
- [ ] Prepare job data matching the interface
- [ ] Call `queueService.add*Job()` method
- [ ] Test in Bull Board dashboard

---

## 📚 What's Available

### Queues (5)
- `notifications` - Push, SMS, Email notifications
- `payments` - Payment processing, refunds
- `consultations` - Reminders, reviews
- `emails` - Transactional emails
- `analytics` - Stats, reports

### Job Types (24)
See `/jobs/*.jobs.ts` files for all available job types.

### Services
- `QueueService` - Add/manage jobs
- `QueueHealthService` - Monitor health

### Monitoring
- Bull Board: `http://localhost:3000/admin/queues`
- Health API: `http://localhost:3000/admin/queue-management/health`

---

## 🆘 Troubleshooting

### Jobs Not Processing

**Problem:** Jobs added but not being processed

**Solution:**
1. Check Redis is running: `redis-cli ping`
2. Check backend logs for processor errors
3. Check Bull Board dashboard for queue status
4. Verify processor is registered in `queue.module.ts`

### Bull Board Not Loading

**Problem:** Dashboard shows 404

**Solution:**
1. Verify backend is running
2. Check URL: `http://localhost:3000/admin/queues` (note: /admin/queues)
3. Check `bull-board.module.ts` is imported in `queue.module.ts`

### High Memory Usage

**Problem:** Redis using too much memory

**Solution:**
1. Clean old jobs: `DELETE /admin/queue-management/{queue}/clean`
2. Reduce job retention in `queue.module.ts`
3. Check for stuck jobs in Bull Board

---

## 📖 Next Steps

1. Read full documentation: `/README.md`
2. Check integration examples: `/examples/*.example.ts`
3. Implement processors with actual services (replace TODOs)
4. Write tests for your processors
5. Set up monitoring alerts

---

## 🔗 Quick Links

- **Full Documentation:** `/README.md`
- **Implementation Details:** `/IMPLEMENTATION_SUMMARY.md`
- **Integration Examples:** `/examples/`
- **BullMQ Docs:** https://docs.bullmq.io/
- **Bull Board:** https://github.com/felixmosh/bull-board

---

**Need Help?**
- Check `/README.md` for detailed documentation
- Review `/examples/` for integration patterns
- Contact: modera@erarta.ai, evgeniy@erarta.ai

---

**Version:** 1.0.0
**Last Updated:** November 23, 2025
