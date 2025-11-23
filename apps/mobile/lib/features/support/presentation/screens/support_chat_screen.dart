import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../widgets/chat_message_bubble.dart';

/// Support chat screen - chat with dispatcher
class SupportChatScreen extends StatefulWidget {
  const SupportChatScreen({super.key});

  @override
  State<SupportChatScreen> createState() => _SupportChatScreenState();
}

class _SupportChatScreenState extends State<SupportChatScreen> {
  late ScrollController _scrollController;
  late TextEditingController _messageController;
  final List<SupportMessage> _messages = [];
  bool _isDispatcherTyping = false;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _messageController = TextEditingController();

    // Load initial messages
    _loadInitialMessages();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  /// Load initial messages
  void _loadInitialMessages() {
    setState(() {
      _messages.addAll([
        SupportMessage(
          id: '1',
          content: 'Здравствуйте! Чем я могу вам помочь?',
          isFromUser: false,
          createdAt: DateTime.now().subtract(const Duration(minutes: 5)),
          senderName: 'Диспетчер',
        ),
      ]);
    });

    // Auto-scroll to bottom
    Future.delayed(const Duration(milliseconds: 300), _scrollToBottom);
  }

  /// Scroll to bottom
  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  /// Send message
  void _sendMessage() {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    // Add user message
    setState(() {
      _messages.add(
        SupportMessage(
          id: DateTime.now().toString(),
          content: text,
          isFromUser: true,
          createdAt: DateTime.now(),
          senderName: 'Вы',
        ),
      );
      _isDispatcherTyping = true;
    });

    _messageController.clear();
    _scrollToBottom();

    // Simulate dispatcher typing
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        _addDispatcherResponse(text);
      }
    });
  }

  /// Add dispatcher response
  void _addDispatcherResponse(String userMessage) {
    final responses = _getDispatcherResponse(userMessage);

    setState(() {
      _isDispatcherTyping = false;
    });

    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        setState(() {
          _messages.add(
            SupportMessage(
              id: DateTime.now().toString(),
              content: responses,
              isFromUser: false,
              createdAt: DateTime.now(),
              senderName: 'Диспетчер',
            ),
          );
        });
        _scrollToBottom();
      }
    });
  }

  /// Get dispatcher response based on user message
  String _getDispatcherResponse(String userMessage) {
    final lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.contains('подписк')) {
      return 'По вопросам подписки вы можете ознакомиться с подробной информацией в разделе "Мои подписки" в меню профиля.';
    } else if (lowerMessage.contains('консультац')) {
      return 'Чтобы забронировать консультацию, откройте раздел "Найти юриста", выберите специалиста и выберите удобное время.';
    } else if (lowerMessage.contains('отмен')) {
      return 'Вы можете отменить консультацию за 30 минут до её начала в разделе "Мои консультации".';
    } else if (lowerMessage.contains('возврат')) {
      return 'Возврат средств обрабатывается в течение 3-5 рабочих дней. Проверьте статус в разделе "История платежей".';
    } else if (lowerMessage.contains('видео')) {
      return 'Видеовызов осуществляется через встроенное приложение. Убедитесь, что у вас включена камера и микрофон.';
    } else if (lowerMessage.contains('спасибо')) {
      return 'Рады помочь! Если у вас ещё есть вопросы, не стесняйтесь спрашивать 😊';
    } else {
      return 'Спасибо за вопрос. Если вам нужна дополнительная помощь, вы можете позвонить нам по номеру 8 (800) 600-18-08.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.grey50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.grey900),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'Чат с диспетчером',
          style: TextStyle(
            color: AppColors.grey900,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: false,
      ),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: _messages.isEmpty
                ? Center(
                    child: Text(
                      'Нет сообщений',
                      style: TextStyle(color: AppColors.grey600),
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    itemCount: _messages.length + (_isDispatcherTyping ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index < _messages.length) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: ChatMessageBubble(message: _messages[index]),
                        );
                      } else {
                        // Typing indicator
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Align(
                            alignment: Alignment.centerLeft,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 10,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'Диспетчер',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const _TypingIndicator(),
                                ],
                              ),
                            ),
                          ),
                        );
                      }
                    },
                  ),
          ),

          // Message input
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    // Attachment button
                    IconButton(
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Функция прикрепления файлов в разработке'),
                          ),
                        );
                      },
                      icon: const Icon(
                        Icons.attach_file,
                        color: AppColors.grey600,
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Text input
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.grey100,
                          borderRadius: BorderRadius.circular(24),
                        ),
                        child: TextField(
                          controller: _messageController,
                          maxLines: null,
                          textCapitalization: TextCapitalization.sentences,
                          decoration: const InputDecoration(
                            hintText: 'Введите сообщение...',
                            hintStyle: TextStyle(
                              color: AppColors.grey600,
                              fontSize: 15,
                            ),
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 10,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),

                    // Send button
                    ValueListenableBuilder<TextEditingValue>(
                      valueListenable: _messageController,
                      builder: (context, value, child) {
                        final hasText = value.text.trim().isNotEmpty;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color:
                                hasText ? AppColors.primary : AppColors.grey100,
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            onPressed: hasText ? _sendMessage : null,
                            icon: Icon(
                              Icons.send,
                              color: hasText ? Colors.white : AppColors.grey600,
                              size: 20,
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Typing indicator widget
class _TypingIndicator extends StatefulWidget {
  const _TypingIndicator();

  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(3, (index) {
        return AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            final value = (_animationController.value * 3 - index).clamp(0, 1);
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 2),
              child: Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(value),
                  shape: BoxShape.circle,
                ),
              ),
            );
          },
        );
      }),
    );
  }
}
