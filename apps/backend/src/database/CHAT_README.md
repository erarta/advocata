# Chat Database Setup

This guide covers the database setup for the **Chat/Messaging** feature in Advocata, including messages, attachments, and Supabase Storage configuration.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Quick Start](#quick-start)
4. [Supabase Storage Setup](#supabase-storage-setup)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Realtime Configuration](#realtime-configuration)
7. [Seed Data](#seed-data)
8. [Query Examples](#query-examples)
9. [Backend Integration](#backend-integration)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Chat system provides real-time messaging between clients and lawyers during consultations with support for:

- **Text messages** with read receipts
- **File attachments** (images, documents, audio, video)
- **Message status tracking** (sending → sent → delivered → read)
- **Soft deletion** (messages can be deleted by sender)
- **Row-level security** (users can only see messages in their consultations)
- **Real-time updates** via Supabase Realtime

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Chat System                           │
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   messages   │────┬───▶│ consultations│             │
│  │              │    │    │               │             │
│  │  - content   │    │    │  - clientId   │             │
│  │  - status    │    │    │  - lawyerId   │             │
│  │  - readAt    │    │    └──────────────┘             │
│  └──────────────┘    │                                  │
│         │            │                                  │
│         ▼            │                                  │
│  ┌──────────────┐    │                                  │
│  │   message_   │    │                                  │
│  │  attachments │────┘                                  │
│  │              │                                       │
│  │  - fileUrl   │         ┌──────────────┐             │
│  │  - fileSize  │────────▶│   Storage    │             │
│  │  - mimeType  │         │    Bucket    │             │
│  └──────────────┘         └──────────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema

### `messages` Table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | uuid_generate_v4() | Primary key |
| `consultationId` | UUID | No | - | FK to consultations table |
| `senderId` | UUID | No | - | User ID of message sender |
| `senderName` | VARCHAR(255) | Yes | - | Display name of sender |
| `senderAvatar` | TEXT | Yes | - | Avatar URL of sender |
| `content` | TEXT | No | - | Message content |
| `type` | VARCHAR(50) | No | 'text' | Message type (text, image, document, audio, video, system) |
| `status` | VARCHAR(50) | No | 'sent' | Message status (sending, sent, delivered, read, failed) |
| `createdAt` | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | Message creation time |
| `deliveredAt` | TIMESTAMPTZ | Yes | - | When message was delivered |
| `readAt` | TIMESTAMPTZ | Yes | - | When message was read |
| `deletedAt` | TIMESTAMPTZ | Yes | - | Soft delete timestamp |

**Indexes:**
- `IDX_MESSAGES_CONSULTATION_ID` - Single index on consultationId
- `IDX_MESSAGES_SENDER_ID` - Single index on senderId
- `IDX_MESSAGES_CREATED_AT` - Single index for sorting
- `IDX_MESSAGES_CONSULTATION_CREATED` - Composite (consultationId, createdAt) for pagination
- `IDX_MESSAGES_STATUS` - Single index for filtering unread
- `idx_messages_realtime` - Partial index for Realtime (WHERE deletedAt IS NULL)

**Foreign Keys:**
- `consultationId` → `consultations.id` (CASCADE on delete)

**Triggers:**
- `trigger_message_delivered` - Auto-updates deliveredAt on insert
- `trigger_message_read` - Auto-updates status to 'read' when readAt is set

---

### `message_attachments` Table

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | uuid_generate_v4() | Primary key |
| `messageId` | UUID | No | - | FK to messages table |
| `fileName` | VARCHAR(500) | No | - | Original file name |
| `fileUrl` | TEXT | No | - | Storage path (not full URL) |
| `fileSize` | BIGINT | No | - | File size in bytes |
| `mimeType` | VARCHAR(100) | No | - | MIME type (e.g., image/png) |
| `createdAt` | TIMESTAMPTZ | No | CURRENT_TIMESTAMP | Upload time |

**Indexes:**
- `IDX_MESSAGE_ATTACHMENTS_MESSAGE_ID` - Single index on messageId

**Foreign Keys:**
- `messageId` → `messages.id` (CASCADE on delete)

**Triggers:**
- `trigger_cleanup_orphaned_attachments` - Deletes file from Storage when record deleted

---

## Quick Start

### 1. Run Migrations

```bash
# Navigate to backend directory
cd apps/backend

# Run all migrations (including chat tables)
npm run migration:run

# Verify migrations
npm run migration:show
```

**Expected Output:**
```
✓ CreateConsultationsTable1700000000000
✓ CreateMessagesTable1700000000001
```

### 2. Set Up Supabase Storage

```bash
# Execute storage setup in Supabase SQL Editor
# Copy contents of: src/database/storage/setup-attachments-bucket.sql
# Paste and run in Supabase Dashboard → SQL Editor
```

This creates:
- `message-attachments` storage bucket (private, 50MB limit)
- RLS policies for secure file access
- Helper functions for file path generation

### 3. Seed Test Data

```bash
# Seed consultations first (messages depend on consultations)
npm run seed:consultations

# Then seed messages
npm run seed:messages

# Or seed all at once
npm run seed:all
```

**Seeded Data:**
- 4 conversations with realistic chat history
- 28 messages total across different consultation types
- 2 file attachments (screenshot + document)

---

## Supabase Storage Setup

### Storage Bucket Configuration

The `message-attachments` bucket stores all file attachments with these settings:

| Setting | Value | Reason |
|---------|-------|--------|
| **Bucket Name** | message-attachments | - |
| **Public Access** | ❌ No (Private) | Security: Only consultation participants can access |
| **Max File Size** | 50 MB | Prevents abuse, sufficient for most documents |
| **Allowed MIME Types** | Images, Docs, Archives, Audio, Video | See full list in setup-attachments-bucket.sql |

### File Organization

Files are organized by consultation and user:

```
message-attachments/
├── consultations/
│   ├── {consultation-id}/
│   │   ├── {user-id}/
│   │   │   ├── 20250118_143022_a3b4c5d6.pdf
│   │   │   ├── 20250118_150510_f7e8d9c0.png
│   │   │   └── ...
```

**Path Format:**
```
consultations/{consultation_id}/{user_id}/{timestamp}_{random}.{extension}
```

**Benefits:**
- Easy to find all files for a consultation
- Simple cleanup when consultation is deleted
- Prevents file name collisions
- Maintains chronological order

### Generating File Paths

Use the SQL helper function:

```sql
SELECT generate_attachment_path(
  'a0000000-0000-0000-0000-000000000001'::UUID,  -- consultation ID
  '11111111-1111-1111-1111-111111111111'::UUID,  -- user ID
  'contract.pdf'                                  -- original filename
);

-- Returns: consultations/a0000000-.../11111111-.../20250118_143022_a3b4c5d6.pdf
```

Or in your backend (NestJS):

```typescript
import { supabase } from '@/shared/infrastructure/supabase';

async uploadAttachment(
  consultationId: string,
  userId: string,
  file: Express.Multer.File,
): Promise<string> {
  // Generate unique path
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
  const random = Math.random().toString(36).substring(2, 10);
  const ext = file.originalname.split('.').pop();

  const filePath = `consultations/${consultationId}/${userId}/${timestamp}_${random}.${ext}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('message-attachments')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  return data.path; // Store this in message_attachments.fileUrl
}
```

### Getting Signed URLs

Files are private, so you need to generate signed URLs for access:

```typescript
async getAttachmentUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('message-attachments')
    .createSignedUrl(filePath, 3600); // Expires in 1 hour

  if (error) throw error;

  return data.signedUrl;
}
```

---

## Row Level Security (RLS)

All tables use RLS to ensure users can only access their own data.

### Messages RLS Policies

**1. Users can view messages in their consultations**
```sql
CREATE POLICY "Users can view messages in their consultations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM consultations
    WHERE consultations.id = messages."consultationId"
    AND (consultations."clientId" = auth.uid() OR consultations."lawyerId" = auth.uid())
  )
);
```

**2. Users can send messages in their consultations**
```sql
CREATE POLICY "Users can send messages in their consultations"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM consultations
    WHERE consultations.id = messages."consultationId"
    AND (consultations."clientId" = auth.uid() OR consultations."lawyerId" = auth.uid())
  )
  AND messages."senderId" = auth.uid()
);
```

**3. Users can mark messages as read**
```sql
CREATE POLICY "Users can mark messages as read"
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM consultations
    WHERE consultations.id = messages."consultationId"
    AND (consultations."clientId" = auth.uid() OR consultations."lawyerId" = auth.uid())
  )
);
```

**4. Users can delete their own messages**
```sql
CREATE POLICY "Users can delete their own messages"
ON messages FOR UPDATE
USING (messages."senderId" = auth.uid());
```

### Storage RLS Policies

Similar policies apply to `storage.objects` for file access control. See `setup-attachments-bucket.sql` for full implementation.

---

## Realtime Configuration

### Enable Realtime for Messages Table

**Option 1: Supabase Dashboard**
1. Go to Database → Replication
2. Enable Realtime for `messages` table
3. Select events: INSERT, UPDATE, DELETE

**Option 2: SQL**
```sql
-- Enable Realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### Subscribe to Messages in Client

**Flutter (Mobile App):**

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class ChatService {
  Stream<List<Message>> subscribeToMessages(String consultationId) {
    return supabase
        .from('messages')
        .stream(primaryKey: ['id'])
        .eq('consultationId', consultationId)
        .order('createdAt')
        .map((data) => data.map((json) => Message.fromJson(json)).toList());
  }
}

// Usage in widget
StreamBuilder<List<Message>>(
  stream: chatService.subscribeToMessages(consultationId),
  builder: (context, snapshot) {
    if (!snapshot.hasData) return CircularProgressIndicator();

    final messages = snapshot.data!;
    return ListView.builder(
      itemCount: messages.length,
      itemBuilder: (context, index) => MessageBubble(message: messages[index]),
    );
  },
)
```

**Web (React/Next.js):**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function useChatMessages(consultationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Load initial messages
    loadMessages();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`consultation-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `consultationId=eq.${consultationId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? (payload.new as Message) : msg
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [consultationId]);

  return messages;
}
```

---

## Seed Data

### Seeded Conversations

After running `npm run seed:messages`, you'll have 4 realistic conversations:

**1. Active Emergency Consultation** (`a0000000-0000-0000-0000-000000000003`)
- Status: Active
- Messages: 8 messages (including system messages)
- Scenario: Client detained by police, lawyer providing urgent legal advice
- Features: Unread messages, various timestamps

**2. Completed Inheritance Consultation** (`a0000000-0000-0000-0000-000000000004`)
- Status: Completed (rated 5 stars)
- Messages: 9 messages
- Scenario: Client asking about contesting a will
- Features: All messages read, detailed legal advice

**3. Pending Car Accident Consultation** (`a0000000-0000-0000-0000-000000000001`)
- Status: Pending
- Messages: 1 initial message from client
- Scenario: Client describing car accident, waiting for lawyer to confirm

**4. Completed Copyright Consultation** (`a0000000-0000-0000-0000-000000000010`)
- Status: Completed (rated 5 stars)
- Messages: 7 messages with 2 attachments
- Scenario: Copyright violation, lawyer sends template document
- Features: Image and document attachments

### Viewing Seeded Data

```sql
-- View all messages for a consultation
SELECT
  m.id,
  m."senderName",
  m.content,
  m.type,
  m.status,
  m."createdAt",
  COUNT(ma.id) AS attachment_count
FROM messages m
LEFT JOIN message_attachments ma ON ma."messageId" = m.id
WHERE m."consultationId" = 'a0000000-0000-0000-0000-000000000003'
GROUP BY m.id
ORDER BY m."createdAt" ASC;

-- View attachments
SELECT
  ma.*,
  m."senderName",
  m."consultationId"
FROM message_attachments ma
JOIN messages m ON m.id = ma."messageId";
```

---

## Query Examples

### Get Messages for Consultation (with Pagination)

```sql
SELECT
  m.*,
  json_agg(
    json_build_object(
      'id', ma.id,
      'fileName', ma."fileName",
      'fileUrl', ma."fileUrl",
      'fileSize', ma."fileSize",
      'mimeType', ma."mimeType"
    )
  ) FILTER (WHERE ma.id IS NOT NULL) AS attachments
FROM messages m
LEFT JOIN message_attachments ma ON ma."messageId" = m.id
WHERE m."consultationId" = $1
  AND m."deletedAt" IS NULL
GROUP BY m.id
ORDER BY m."createdAt" DESC
LIMIT 50 OFFSET 0;
```

### Count Unread Messages for User

```sql
SELECT COUNT(*)
FROM messages m
JOIN consultations c ON c.id = m."consultationId"
WHERE c."clientId" = $1  -- Or c."lawyerId" = $1
  AND m."senderId" != $1
  AND m."readAt" IS NULL
  AND m."deletedAt" IS NULL;
```

### Mark Messages as Read

```sql
UPDATE messages
SET
  "readAt" = CURRENT_TIMESTAMP,
  status = 'read'
WHERE "consultationId" = $1
  AND "senderId" != $2
  AND "readAt" IS NULL
RETURNING id;
```

### Get Last Message for Each Consultation

```sql
SELECT DISTINCT ON (m."consultationId")
  m.*,
  c."clientId",
  c."lawyerId",
  c.status AS consultation_status
FROM messages m
JOIN consultations c ON c.id = m."consultationId"
WHERE m."deletedAt" IS NULL
ORDER BY m."consultationId", m."createdAt" DESC;
```

### Get Storage Stats for Consultation

```sql
SELECT * FROM message_attachment_stats
WHERE consultation_id = 'a0000000-0000-0000-0000-000000000003';

-- Returns:
-- consultation_id | total_attachments | total_size_mb | unique_mime_types | mime_type_breakdown
```

---

## Backend Integration

### Message Service Example (NestJS)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageOrmEntity } from './message.orm-entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private messageRepository: Repository<MessageOrmEntity>,
  ) {}

  async sendMessage(
    consultationId: string,
    senderId: string,
    content: string,
    type: string = 'text',
  ): Promise<MessageOrmEntity> {
    const message = this.messageRepository.create({
      consultationId,
      senderId,
      content,
      type,
      status: 'sent',
    });

    return await this.messageRepository.save(message);
  }

  async getMessages(
    consultationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<MessageOrmEntity[]> {
    return await this.messageRepository.find({
      where: {
        consultationId,
        deletedAt: null,
      },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['attachments'],
    });
  }

  async markAsRead(
    consultationId: string,
    userId: string,
  ): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update()
      .set({
        readAt: new Date(),
        status: 'read',
      })
      .where('consultationId = :consultationId', { consultationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('readAt IS NULL')
      .execute();
  }
}
```

### Attachment Upload Endpoint

```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('messages')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private storageService: StorageService,
  ) {}

  @Post(':messageId/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @Param('messageId') messageId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Validate file size and type
    if (file.size > 50 * 1024 * 1024) {
      throw new BadRequestException('File too large (max 50MB)');
    }

    // Upload to Supabase Storage
    const filePath = await this.storageService.uploadAttachment(
      messageId,
      file,
    );

    // Save attachment record
    const attachment = await this.messageService.createAttachment({
      messageId,
      fileName: file.originalname,
      fileUrl: filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
    });

    // Get signed URL for immediate access
    const signedUrl = await this.storageService.getSignedUrl(filePath);

    return {
      ...attachment,
      signedUrl,
    };
  }
}
```

---

## Troubleshooting

### Messages Not Appearing in Realtime

**Check 1: Realtime Enabled?**
```sql
-- Verify Realtime is enabled for messages table
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'messages';
```

If not enabled:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

**Check 2: RLS Blocking Access?**

Temporarily disable RLS to test (DO NOT use in production):
```sql
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

If messages appear, the issue is with RLS policies. Re-enable and fix policies:
```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### File Upload Fails

**Error: "new row violates row-level security policy"**

Solution: Ensure `auth.uid()` returns the correct user ID. Check your JWT token:

```typescript
const user = await supabase.auth.getUser();
console.log('User ID:', user.data.user?.id);
```

**Error: "Bucket not found"**

Solution: Run the storage setup SQL script in Supabase Dashboard.

**Error: "File size exceeds limit"**

Solution: File is > 50MB. Either compress the file or increase bucket limit:

```sql
UPDATE storage.buckets
SET file_size_limit = 104857600  -- 100 MB
WHERE id = 'message-attachments';
```

### Migration Fails

**Error: "relation messages already exists"**

Solution: Migration was already run. Check status:
```bash
npm run migration:show
```

To rollback:
```bash
npm run migration:revert
```

Then re-run:
```bash
npm run migration:run
```

### Seed Fails with Foreign Key Violation

**Error: "violates foreign key constraint FK_MESSAGES_CONSULTATION"**

Solution: Run consultation seed first:
```bash
npm run seed:consultations
npm run seed:messages
```

Or use:
```bash
npm run seed:all
```

---

## Performance Optimization

### Index Usage

All common queries are optimized with indexes:

| Query Pattern | Index Used |
|---------------|------------|
| Get messages by consultation | `IDX_MESSAGES_CONSULTATION_ID` |
| Pagination (consultation + createdAt) | `IDX_MESSAGES_CONSULTATION_CREATED` |
| Filter by sender | `IDX_MESSAGES_SENDER_ID` |
| Get unread messages | `IDX_MESSAGES_STATUS` |
| Realtime subscription | `idx_messages_realtime` (partial) |

### Query Performance Tips

1. **Always filter by consultationId first**
   ```sql
   -- Good
   WHERE consultationId = $1 AND status = 'delivered'

   -- Bad (full table scan)
   WHERE status = 'delivered'
   ```

2. **Use pagination** - Never fetch all messages at once:
   ```sql
   LIMIT 50 OFFSET 0  -- Load 50 messages at a time
   ```

3. **Exclude soft-deleted messages**:
   ```sql
   WHERE deletedAt IS NULL
   ```

4. **Batch mark as read**:
   ```sql
   -- Update multiple messages in one query
   UPDATE messages
   SET readAt = NOW()
   WHERE consultationId = $1 AND senderId != $2
   ```

---

## Next Steps

1. **Implement Message Module** in backend (Domain + Application + Infrastructure + Presentation layers)
2. **Add WebSocket Support** for real-time message delivery notifications
3. **Implement Push Notifications** when user is offline
4. **Add Message Search** with full-text search on content
5. **Add Message Reactions** (emoji reactions like 👍 ❤️)
6. **Add Voice Messages** support
7. **Add Message Encryption** for end-to-end security

---

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [TypeORM Migrations](https://typeorm.io/migrations)

---

**Version**: 1.0
**Last Updated**: January 18, 2025
**Status**: Production Ready ✅
