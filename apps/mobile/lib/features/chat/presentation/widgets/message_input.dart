import 'package:flutter/material.dart';
import '../../../../core/presentation/theme/app_colors.dart';

/// Message input widget
class MessageInput extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSend;
  final VoidCallback onAttachment;
  final ValueChanged<String>? onChanged;

  const MessageInput({
    Key? key,
    required this.controller,
    required this.onSend,
    required this.onAttachment,
    this.onChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
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
                onPressed: onAttachment,
                icon: const Icon(
                  Icons.attach_file,
                  color: AppColors.textSecondary,
                ),
                tooltip: 'Прикрепить файл',
              ),
              const SizedBox(width: 8),

              // Text input
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: TextField(
                    controller: controller,
                    onChanged: onChanged,
                    maxLines: null,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(
                      hintText: 'Введите сообщение...',
                      hintStyle: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 15,
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 10,
                      ),
                    ),
                    onSubmitted: (_) => onSend(),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Send button
              ValueListenableBuilder<TextEditingValue>(
                valueListenable: controller,
                builder: (context, value, child) {
                  final hasText = value.text.trim().isNotEmpty;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: hasText ? AppColors.primary : AppColors.surface,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      onPressed: hasText ? onSend : null,
                      icon: Icon(
                        Icons.send,
                        color: hasText ? Colors.white : AppColors.textSecondary,
                        size: 20,
                      ),
                      tooltip: 'Отправить',
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
