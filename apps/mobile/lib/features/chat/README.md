# Chat/Messaging Feature

## Status: Partial Implementation

This feature is partially implemented with basic structure.

## TODO - Complete Implementation

### Domain Layer (Pending)
- `MessageEntity` - message with text, files, status
- `ChatSessionEntity` - chat session with messages
- `ChatRepository` - interface for chat operations
- Use cases:
  - SendMessageUseCase
  - GetMessagesUseCase
  - MarkAsReadUseCase

### Data Layer (Pending)
- `MessageModel` with JSON serialization
- `ChatRemoteDataSource` - Supabase Realtime integration
- `ChatWebSocketDataSource` - WebSocket for real-time messaging
- `ChatRepositoryImpl`

### Presentation Layer (Pending)
- `ChatScreen` with message list and input
- `MessageBubble` widget
- `MessageInput` widget with file attachment
- `TypingIndicator` widget
- Real-time message updates with Riverpod

## Integration Points

- Connect to `ConsultationEntity` via `consultationId`
- Use Supabase Realtime for WebSocket connection
- Support text messages and file attachments
- Show typing indicators
- Mark messages as read/delivered

## Implementation Priority

**Priority:** Medium (after Video Call)

**Estimated Time:** 5-7 hours

**Dependencies:**
- Supabase Realtime subscription
- File upload to Supabase Storage
- Backend WebSocket endpoint for real-time messaging

## Sample Code Structure

```dart
// Domain
class MessageEntity {
  final String id;
  final String consultationId;
  final String senderId;
  final String content;
  final MessageType type; // text, image, document
  final DateTime createdAt;
  final bool isRead;
}

// Usage
await SendMessageUseCase().execute(SendMessageParams(
  consultationId: 'xxx',
  content: 'Hello',
  type: MessageType.text,
));
```

## Next Steps

1. Implement Domain Layer entities and use cases
2. Create Supabase Realtime integration
3. Build ChatScreen UI with message list
4. Add file attachment support
5. Implement typing indicators
6. Test real-time messaging
