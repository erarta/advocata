# Database Migrations & Seeds

This directory contains TypeORM migrations and seed data for the Advocata database.

## 📁 Structure

```
database/
├── migrations/         # TypeORM migrations
│   └── 1700000000000-CreateConsultationsTable.ts
├── seeds/             # Seed data scripts
│   └── consultation.seed.ts
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Database must be running:**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d postgres

   # Or manually with PostgreSQL
   psql -U postgres
   CREATE DATABASE advocata;
   ```

2. **Environment variables configured:**
   ```bash
   # Copy example env file
   cp .env.example .env

   # Edit .env with your database credentials
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=advocata
   DB_PASSWORD=advocata_dev_password
   DB_DATABASE=advocata
   ```

## 📊 Running Migrations

### Run all pending migrations
```bash
npm run migration:run
```

### Revert last migration
```bash
npm run migration:revert
```

### Show migration status
```bash
npm run migration:show
```

### Create new migration
```bash
npm run migration:create src/database/migrations/YourMigrationName
```

### Generate migration from entity changes
```bash
npm run migration:generate src/database/migrations/YourMigrationName
```

## 🌱 Running Seeds

### Seed consultations table
```bash
npm run seed:consultations
```

This will:
- Clear existing consultation data
- Insert 10 test consultations with various statuses:
  - 1 Pending (waiting for lawyer confirmation)
  - 1 Confirmed (lawyer confirmed, waiting for scheduled time)
  - 1 Active (currently in progress)
  - 2 Completed (one with rating, one without)
  - 2 Cancelled (one by client, one technical issue)
  - 1 Expired (no lawyer confirmation)
  - 1 Failed (technical issues during consultation)
  - 1 Completed chat consultation

## 📋 Migration: CreateConsultationsTable

**File:** `1700000000000-CreateConsultationsTable.ts`

### Creates table: `consultations`

**Columns:**
- `id` - UUID primary key
- `clientId` - UUID (references users.id)
- `lawyerId` - UUID (references lawyers.id)
- `type` - VARCHAR(50): emergency, scheduled, phone, video, chat, in_person
- `status` - VARCHAR(50): pending, confirmed, active, completed, cancelled, failed, expired
- `description` - TEXT
- `price` - DECIMAL(10,2)
- `currency` - VARCHAR(10) default 'RUB'
- `scheduledStart` - TIMESTAMP WITH TIME ZONE (nullable)
- `scheduledEnd` - TIMESTAMP WITH TIME ZONE (nullable)
- `confirmedAt` - TIMESTAMP WITH TIME ZONE (nullable)
- `startedAt` - TIMESTAMP WITH TIME ZONE (nullable)
- `completedAt` - TIMESTAMP WITH TIME ZONE (nullable)
- `cancelledAt` - TIMESTAMP WITH TIME ZONE (nullable)
- `rating` - INT (nullable, 1-5)
- `review` - TEXT (nullable)
- `cancellationReason` - VARCHAR(500) (nullable)
- `createdAt` - TIMESTAMP WITH TIME ZONE (auto)
- `updatedAt` - TIMESTAMP WITH TIME ZONE (auto)

**Indexes:**
- `IDX_CONSULTATIONS_CLIENT_ID` - On clientId
- `IDX_CONSULTATIONS_LAWYER_ID` - On lawyerId
- `IDX_CONSULTATIONS_STATUS` - On status
- `IDX_CONSULTATIONS_CLIENT_STATUS` - Composite on (clientId, status)
- `IDX_CONSULTATIONS_LAWYER_STATUS` - Composite on (lawyerId, status)
- `IDX_CONSULTATIONS_SCHEDULED_START` - On scheduledStart
- `IDX_CONSULTATIONS_CREATED_AT` - On createdAt

## 🧪 Test Data (Seeds)

### Test User IDs
```typescript
clientId1  = '11111111-1111-1111-1111-111111111111'
clientId2  = '22222222-2222-2222-2222-222222222222'
lawyerId1  = '33333333-3333-3333-3333-333333333333'
lawyerId2  = '44444444-4444-4444-4444-444444444444'
```

### Consultation Statuses Seeded
| ID | Type | Status | Description |
|----|------|--------|-------------|
| ...001 | scheduled | pending | Waiting for lawyer confirmation |
| ...002 | scheduled | confirmed | Lawyer confirmed, scheduled for next week |
| ...003 | emergency | active | Currently in progress (URGENT case) |
| ...004 | video | completed | Completed with 5-star rating + review |
| ...005 | phone | completed | Completed, no rating yet |
| ...006 | scheduled | cancelled | Client cancelled - "Решил вопрос сам" |
| ...007 | emergency | cancelled | Lawyer couldn't connect - technical issues |
| ...008 | scheduled | expired | No lawyer confirmation in time |
| ...009 | video | failed | Video connection failed during consultation |
| ...010 | chat | completed | Written consultation, 5-star rating |

## 🔧 Troubleshooting

### Migration fails with "relation already exists"
```bash
# Drop and recreate database (DEV ONLY!)
psql -U postgres
DROP DATABASE advocata;
CREATE DATABASE advocata;

# Run migrations again
npm run migration:run
```

### Seed fails with foreign key constraint
Make sure you have users and lawyers in the database with the test IDs, or modify the seed data to use existing IDs.

### TypeORM CLI not found
```bash
# Install dependencies
npm install

# Make sure ts-node is installed
npm install -D ts-node @types/node
```

## 📝 Best Practices

1. **Never edit existing migrations** - Create new ones instead
2. **Always test migrations locally first** before deploying
3. **Run migrations in order** - Don't skip migrations
4. **Backup production data** before running migrations
5. **Use seeds only in development/testing** - Never in production

## 🚨 Production Deployment

```bash
# 1. Backup database
pg_dump advocata > backup_$(date +%Y%m%d).sql

# 2. Run migrations
NODE_ENV=production npm run migration:run

# 3. Verify migration status
npm run migration:show

# 4. If something goes wrong, revert
npm run migration:revert
```

## 📖 Learn More

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL Indexes Best Practices](https://www.postgresql.org/docs/current/indexes.html)
