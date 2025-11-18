import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/presentation/theme/app_colors.dart';
import '../../../../core/presentation/widgets/loading_indicator.dart';
import '../providers/chat_controller.dart';
import '../widgets/message_bubble.dart';
import '../widgets/message_input.dart';
import '../widgets/typing_indicator.dart';

/// Chat screen
class ChatScreen extends ConsumerStatefulWidget {
  final String consultationId;
  final String lawyerName;
  final String? lawyerAvatar;

  const ChatScreen({
    Key? key,
    required this.consultationId,
    required this.lawyerName,
    this.lawyerAvatar,
  }) : super(key: key);

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _scrollController = ScrollController();
  final _messageController = TextEditingController();
  Timer? _typingTimer;
  bool _isTyping = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _messageController.dispose();
    _typingTimer?.cancel();
    super.dispose();
  }

  /// Handle scroll - load more messages when reaching top
  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMoreMessages();
    }
  }

  /// Load more messages
  void _loadMoreMessages() {
    final controller = ref.read(chatControllerProvider(widget.consultationId).notifier);
    controller.loadMoreMessages();
  }

  /// Handle text change - update typing status
  void _onTextChanged(String text) {
    final controller = ref.read(chatControllerProvider(widget.consultationId).notifier);

    if (text.trim().isNotEmpty && !_isTyping) {
      _isTyping = true;
      controller.updateTypingStatus(true);
    }

    // Cancel previous timer
    _typingTimer?.cancel();

    // Set new timer to stop typing after 2 seconds of inactivity
    _typingTimer = Timer(const Duration(seconds: 2), () {
      if (_isTyping) {
        _isTyping = false;
        controller.updateTypingStatus(false);
      }
    });
  }

  /// Send message
  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    final controller = ref.read(chatControllerProvider(widget.consultationId).notifier);
    controller.sendMessage(text);

    // Clear input and stop typing
    _messageController.clear();
    if (_isTyping) {
      _isTyping = false;
      controller.updateTypingStatus(false);
    }

    // Scroll to bottom
    _scrollToBottom();
  }

  /// Send attachment
  void _sendAttachment() {
    // TODO: Implement file picker and send attachment
    // For now, show a message
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Отправка файлов будет добавлена в следующей версии'),
      ),
    );
  }

  /// Scroll to bottom
  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final chatState = ref.watch(chatControllerProvider(widget.consultationId));

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            if (widget.lawyerAvatar != null)
              CircleAvatar(
                radius: 18,
                backgroundImage: NetworkImage(widget.lawyerAvatar!),
              )
            else
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primary.withOpacity(0.1),
                child: Text(
                  widget.lawyerName[0].toUpperCase(),
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.lawyerName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  chatState.maybeWhen(
                    loaded: (_, __, ___, isTyping) => isTyping
                        ? const Text(
                            'печатает...',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          )
                        : const Text(
                            'онлайн',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.success,
                            ),
                          ),
                    orElse: () => const SizedBox.shrink(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: chatState.when(
              initial: () => const Center(child: LoadingIndicator()),
              loading: () => const Center(child: LoadingIndicator()),
              loaded: (messages, hasMore, isLoadingMore, isTyping) {
                if (messages.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 64,
                          color: AppColors.textSecondary.withOpacity(0.3),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Нет сообщений',
                          style: TextStyle(
                            fontSize: 16,
                            color: AppColors.textSecondary.withOpacity(0.6),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Начните общение с юристом',
                          style: TextStyle(
                            fontSize: 14,
                            color: AppColors.textSecondary.withOpacity(0.5),
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return Column(
                  children: [
                    // Load more indicator
                    if (isLoadingMore)
                      const Padding(
                        padding: EdgeInsets.all(16),
                        child: LoadingIndicator(),
                      ),
                    // Messages
                    Expanded(
                      child: ListView.builder(
                        controller: _scrollController,
                        reverse: true,
                        padding: const EdgeInsets.all(16),
                        itemCount: messages.length + (isTyping ? 1 : 0),
                        itemBuilder: (context, index) {
                          // Show typing indicator at the top
                          if (isTyping && index == 0) {
                            return const Padding(
                              padding: EdgeInsets.only(bottom: 8),
                              child: TypingIndicator(),
                            );
                          }

                          final messageIndex = isTyping ? index - 1 : index;
                          final message = messages[messageIndex];

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: MessageBubble(message: message),
                          );
                        },
                      ),
                    ),
                  ],
                );
              },
              sending: (messages, pendingMessage) {
                return ListView.builder(
                  controller: _scrollController,
                  reverse: true,
                  padding: const EdgeInsets.all(16),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: MessageBubble(message: message),
                    );
                  },
                );
              },
              error: (errorMessage, messages) {
                return Column(
                  children: [
                    // Error banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      color: AppColors.error.withOpacity(0.1),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.error_outline,
                            color: AppColors.error,
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              errorMessage,
                              style: const TextStyle(
                                color: AppColors.error,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Show messages if available
                    if (messages != null && messages.isNotEmpty)
                      Expanded(
                        child: ListView.builder(
                          controller: _scrollController,
                          reverse: true,
                          padding: const EdgeInsets.all(16),
                          itemCount: messages.length,
                          itemBuilder: (context, index) {
                            final message = messages[index];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: MessageBubble(message: message),
                            );
                          },
                        ),
                      )
                    else
                      const Expanded(
                        child: Center(
                          child: Text('Не удалось загрузить сообщения'),
                        ),
                      ),
                  ],
                );
              },
            ),
          ),
          // Message input
          MessageInput(
            controller: _messageController,
            onChanged: _onTextChanged,
            onSend: _sendMessage,
            onAttachment: _sendAttachment,
          ),
        ],
      ),
    );
  }
}
