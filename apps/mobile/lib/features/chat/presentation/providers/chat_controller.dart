import 'dart:async';
import 'dart:io';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/supabase_config.dart';
import '../../domain/entities/message_entity.dart';
import '../../domain/usecases/get_messages_usecase.dart';
import '../../domain/usecases/mark_as_read_usecase.dart';
import '../../domain/usecases/send_message_usecase.dart';
import '../../domain/usecases/upload_attachment_usecase.dart';
import '../../../chat/data/datasources/chat_remote_datasource.dart';
import '../../../chat/data/repositories/chat_repository_impl.dart';
import 'chat_state.dart';

/// Chat controller
class ChatController extends StateNotifier<ChatState> {
  final String consultationId;
  final GetMessagesUseCase getMessagesUseCase;
  final SendMessageUseCase sendMessageUseCase;
  final MarkAsReadUseCase markAsReadUseCase;
  final MarkAllAsReadUseCase markAllAsReadUseCase;
  final UploadAttachmentUseCase uploadAttachmentUseCase;

  StreamSubscription<MessageEntity>? _messageSubscription;
  StreamSubscription<bool>? _typingSubscription;

  ChatController({
    required this.consultationId,
    required this.getMessagesUseCase,
    required this.sendMessageUseCase,
    required this.markAsReadUseCase,
    required this.markAllAsReadUseCase,
    required this.uploadAttachmentUseCase,
  }) : super(const ChatState.initial()) {
    _initialize();
  }

  /// Initialize chat - load messages and setup real-time listeners
  Future<void> _initialize() async {
    state = const ChatState.loading();
    await loadMessages();
    _listenToNewMessages();
    _listenToTypingStatus();
  }

  /// Load messages
  Future<void> loadMessages({String? beforeMessageId}) async {
    final isLoadingMore = beforeMessageId != null;

    // Update state to show loading
    state.maybeWhen(
      loaded: (messages, hasMore, _, isTyping) {
        if (isLoadingMore) {
          state = ChatState.loaded(
            messages: messages,
            hasMore: hasMore,
            isLoadingMore: true,
            isTyping: isTyping,
          );
        }
      },
      orElse: () {
        state = const ChatState.loading();
      },
    );

    final result = await getMessagesUseCase.execute(
      GetMessagesParams(
        consultationId: consultationId,
        limit: 50,
        beforeMessageId: beforeMessageId,
      ),
    );

    result.when(
      success: (newMessages) {
        state.maybeWhen(
          loaded: (existingMessages, _, __, isTyping) {
            // Append new messages to existing ones (for pagination)
            final allMessages = isLoadingMore
                ? [...existingMessages, ...newMessages]
                : newMessages;

            state = ChatState.loaded(
              messages: allMessages,
              hasMore: newMessages.length >= 50,
              isLoadingMore: false,
              isTyping: isTyping,
            );
          },
          orElse: () {
            state = ChatState.loaded(
              messages: newMessages,
              hasMore: newMessages.length >= 50,
              isLoadingMore: false,
            );
          },
        );

        // Mark all messages as read
        markAllAsReadUseCase.execute(consultationId);
      },
      failure: (failure) {
        state = ChatState.error(message: failure.message);
      },
    );
  }

  /// Send text message
  Future<void> sendMessage(String content) async {
    if (content.trim().isEmpty) return;

    final currentUserId = SupabaseConfig.currentUser?.id;
    if (currentUserId == null) return;

    // Create pending message for optimistic UI
    final pendingMessage = MessageEntity(
      id: 'pending_${DateTime.now().millisecondsSinceEpoch}',
      consultationId: consultationId,
      senderId: currentUserId,
      content: content.trim(),
      type: MessageType.text,
      status: MessageStatus.sending,
      attachments: const [],
      createdAt: DateTime.now(),
    );

    // Update state to show pending message
    state.maybeWhen(
      loaded: (messages, hasMore, isLoadingMore, isTyping) {
        state = ChatState.sending(
          messages: [pendingMessage, ...messages],
          pendingMessage: pendingMessage,
        );
      },
      orElse: () {
        state = ChatState.sending(
          messages: [pendingMessage],
          pendingMessage: pendingMessage,
        );
      },
    );

    // Send message via use case
    final result = await sendMessageUseCase.execute(
      SendMessageParams(
        consultationId: consultationId,
        content: content.trim(),
        type: MessageType.text,
      ),
    );

    result.when(
      success: (sentMessage) {
        // Replace pending message with sent message
        state.maybeWhen(
          sending: (messages, pending) {
            final updatedMessages = messages
                .map((msg) => msg.id == pending.id ? sentMessage : msg)
                .toList();

            state = ChatState.loaded(
              messages: updatedMessages,
              hasMore: false,
              isLoadingMore: false,
            );
          },
          orElse: () {},
        );
      },
      failure: (failure) {
        // Mark pending message as failed
        state.maybeWhen(
          sending: (messages, pending) {
            final failedMessage = pending.copyWith(
              status: MessageStatus.failed,
            );
            final updatedMessages = messages
                .map((msg) => msg.id == pending.id ? failedMessage : msg)
                .toList();

            state = ChatState.error(
              message: failure.message,
              messages: updatedMessages,
            );
          },
          orElse: () {
            state = ChatState.error(message: failure.message);
          },
        );
      },
    );
  }

  /// Send attachment
  Future<void> sendAttachment(File file) async {
    final currentUserId = SupabaseConfig.currentUser?.id;
    if (currentUserId == null) return;

    // Upload attachment first
    final uploadResult = await uploadAttachmentUseCase.execute(
      file: file,
      consultationId: consultationId,
    );

    uploadResult.when(
      success: (attachment) async {
        // Create pending message with attachment
        final pendingMessage = MessageEntity(
          id: 'pending_${DateTime.now().millisecondsSinceEpoch}',
          consultationId: consultationId,
          senderId: currentUserId,
          content: attachment.fileName,
          type: _getMessageTypeFromMimeType(attachment.mimeType),
          status: MessageStatus.sending,
          attachments: [attachment],
          createdAt: DateTime.now(),
        );

        // Update state to show pending message
        state.maybeWhen(
          loaded: (messages, hasMore, isLoadingMore, isTyping) {
            state = ChatState.sending(
              messages: [pendingMessage, ...messages],
              pendingMessage: pendingMessage,
            );
          },
          orElse: () {
            state = ChatState.sending(
              messages: [pendingMessage],
              pendingMessage: pendingMessage,
            );
          },
        );

        // Send message with attachment
        final result = await sendMessageUseCase.execute(
          SendMessageParams(
            consultationId: consultationId,
            content: attachment.fileName,
            type: _getMessageTypeFromMimeType(attachment.mimeType),
          ),
        );

        result.when(
          success: (sentMessage) {
            state.maybeWhen(
              sending: (messages, pending) {
                final updatedMessages = messages
                    .map((msg) => msg.id == pending.id ? sentMessage : msg)
                    .toList();

                state = ChatState.loaded(
                  messages: updatedMessages,
                  hasMore: false,
                  isLoadingMore: false,
                );
              },
              orElse: () {},
            );
          },
          failure: (failure) {
            state = ChatState.error(message: failure.message);
          },
        );
      },
      failure: (failure) {
        state = ChatState.error(message: failure.message);
      },
    );
  }

  /// Mark message as read
  Future<void> markMessageAsRead(String messageId) async {
    await markAsReadUseCase.execute(messageId);
  }

  /// Load more messages (pagination)
  Future<void> loadMoreMessages() async {
    final lastMessageId = state.maybeWhen(
      loaded: (messages, hasMore, isLoadingMore, _) {
        if (!hasMore || isLoadingMore || messages.isEmpty) return null;
        return messages.last.id;
      },
      orElse: () => null,
    );

    if (lastMessageId != null) {
      await loadMessages(beforeMessageId: lastMessageId);
    }
  }

  /// Listen to new messages in real-time
  void _listenToNewMessages() {
    final repository = ChatRepositoryImpl(
      remoteDataSource: ChatRemoteDataSourceImpl(
        supabaseClient: SupabaseConfig.client,
      ),
    );

    _messageSubscription = repository.watchMessages(consultationId).listen(
      (newMessage) {
        state.maybeWhen(
          loaded: (messages, hasMore, isLoadingMore, isTyping) {
            // Check if message already exists
            final exists = messages.any((msg) => msg.id == newMessage.id);
            if (exists) return;

            // Add new message to the beginning of the list
            final updatedMessages = [newMessage, ...messages];

            state = ChatState.loaded(
              messages: updatedMessages,
              hasMore: hasMore,
              isLoadingMore: isLoadingMore,
              isTyping: isTyping,
            );

            // Mark as read if it's not from current user
            final currentUserId = SupabaseConfig.currentUser?.id;
            if (newMessage.senderId != currentUserId) {
              markMessageAsRead(newMessage.id);
            }
          },
          orElse: () {},
        );
      },
      onError: (error) {
        // Handle real-time connection errors silently
      },
    );
  }

  /// Listen to typing status in real-time
  void _listenToTypingStatus() {
    final repository = ChatRepositoryImpl(
      remoteDataSource: ChatRemoteDataSourceImpl(
        supabaseClient: SupabaseConfig.client,
      ),
    );

    _typingSubscription = repository.watchTypingStatus(consultationId).listen(
      (isTyping) {
        state.maybeWhen(
          loaded: (messages, hasMore, isLoadingMore, _) {
            state = ChatState.loaded(
              messages: messages,
              hasMore: hasMore,
              isLoadingMore: isLoadingMore,
              isTyping: isTyping,
            );
          },
          orElse: () {},
        );
      },
      onError: (error) {
        // Handle typing indicator errors silently
      },
    );
  }

  /// Update typing status
  Future<void> updateTypingStatus(bool isTyping) async {
    final repository = ChatRepositoryImpl(
      remoteDataSource: ChatRemoteDataSourceImpl(
        supabaseClient: SupabaseConfig.client,
      ),
    );

    await repository.updateTypingStatus(
      consultationId: consultationId,
      isTyping: isTyping,
    );
  }

  /// Get message type from MIME type
  MessageType _getMessageTypeFromMimeType(String mimeType) {
    if (mimeType.startsWith('image/')) {
      return MessageType.image;
    } else if (mimeType.startsWith('audio/')) {
      return MessageType.audio;
    } else if (mimeType.startsWith('video/')) {
      return MessageType.video;
    } else {
      return MessageType.document;
    }
  }

  @override
  void dispose() {
    _messageSubscription?.cancel();
    _typingSubscription?.cancel();
    super.dispose();
  }
}

/// Chat controller provider
final chatControllerProvider = StateNotifierProvider.family<ChatController, ChatState, String>(
  (ref, consultationId) {
    // Create repository
    final repository = ChatRepositoryImpl(
      remoteDataSource: ChatRemoteDataSourceImpl(
        supabaseClient: SupabaseConfig.client,
      ),
    );

    // Create use cases
    final getMessagesUseCase = GetMessagesUseCase(repository);
    final sendMessageUseCase = SendMessageUseCase(repository);
    final markAsReadUseCase = MarkAsReadUseCase(repository);
    final markAllAsReadUseCase = MarkAllAsReadUseCase(repository);
    final uploadAttachmentUseCase = UploadAttachmentUseCase(repository);

    return ChatController(
      consultationId: consultationId,
      getMessagesUseCase: getMessagesUseCase,
      sendMessageUseCase: sendMessageUseCase,
      markAsReadUseCase: markAsReadUseCase,
      markAllAsReadUseCase: markAllAsReadUseCase,
      uploadAttachmentUseCase: uploadAttachmentUseCase,
    );
  },
);
