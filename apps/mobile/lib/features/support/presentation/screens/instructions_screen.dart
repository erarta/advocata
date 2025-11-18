import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

/// Instructions screen - Help and FAQ
class InstructionsScreen extends StatefulWidget {
  const InstructionsScreen({super.key});

  @override
  State<InstructionsScreen> createState() => _InstructionsScreenState();
}

class _InstructionsScreenState extends State<InstructionsScreen> {
  final List<_InstructionItem> _instructions = [
    _InstructionItem(
      title: 'Как вызвать адвоката?',
      icon: Icons.phone_in_talk_outlined,
      steps: [
        'Откройте вкладку "Найти юриста"',
        'Укажите требуемую специализацию (ДТП, уголовное право и т.д.)',
        'Выберите адвоката из предложенного списка',
        'Выберите удобное время для консультации',
        'Подтвердите бронирование и оплату',
      ],
    ),
    _InstructionItem(
      title: 'Как оформить подписку?',
      icon: Icons.card_membership_outlined,
      steps: [
        'Перейдите в раздел "Подписка" в главном меню',
        'Выберите подходящий тариф (Стандартный, Премиум)',
        'Нажмите кнопку "Подписаться"',
        'Выберите способ оплаты',
        'Подтвердите платёж',
        'Подписка активируется немедленно',
      ],
    ),
    _InstructionItem(
      title: 'Как найти документы?',
      icon: Icons.description_outlined,
      steps: [
        'Откройте вкладку "Документы" в главном меню',
        'Документы разделены по категориям',
        'Используйте поиск для быстрого поиска нужного документа',
        'Нажмите на документ для просмотра полного текста',
      ],
    ),
    _InstructionItem(
      title: 'Как начать видеоконсультацию?',
      icon: Icons.videocam_outlined,
      steps: [
        'Перейдите в раздел "Мои консультации"',
        'Выберите консультацию со статусом "Готово"',
        'Нажмите кнопку "Начать видеозвонок"',
        'Разрешите доступ к камере и микрофону',
        'Дождитесь подключения адвоката',
      ],
    ),
    _InstructionItem(
      title: 'Что делать при ДТП?',
      icon: Icons.warning_outlined,
      steps: [
        'Убедитесь в безопасности, включите аварийку',
        'Сфотографируйте повреждения обеих машин',
        'Получите контакты других водителей и свидетелей',
        'Отправьте фото и информацию нашему адвокату через чат',
        'Адвокат поможет вам разобраться в ситуации',
        'Следуйте рекомендациям адвоката',
      ],
    ),
    _InstructionItem(
      title: 'Как отменить консультацию?',
      icon: Icons.cancel_outlined,
      steps: [
        'Откройте раздел "Мои консультации"',
        'Выберите консультацию, которую хотите отменить',
        'Нажмите кнопку "Отменить консультацию"',
        'Подтвердите отмену',
        'Возврат будет обработан автоматически',
        'Срок возврата: 3-5 рабочих дней',
      ],
    ),
    _InstructionItem(
      title: 'Как добавить платёжный способ?',
      icon: Icons.payment_outlined,
      steps: [
        'Откройте раздел "Профиль"',
        'Нажмите на "Способы оплаты"',
        'Нажмите кнопку "Добавить карту"',
        'Введите данные вашей кредитной/дебетовой карты',
        'Подтвердите добавление',
      ],
    ),
    _InstructionItem(
      title: 'Как оставить отзыв?',
      icon: Icons.star_outline,
      steps: [
        'Перейдите в раздел "Мои консультации"',
        'Выберите завершённую консультацию',
        'Нажмите кнопку "Оставить отзыв"',
        'Выставьте оценку от 1 до 5 звёзд',
        'Напишите комментарий (опционально)',
        'Отправьте отзыв',
      ],
    ),
  ];

  int? _expandedIndex;

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
          'Инструкции',
          style: TextStyle(
            color: AppColors.grey900,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header text
              Text(
                'Помощь в разных ситуациях',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.grey900,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Пошаговые инструкции для решения различных задач',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.grey600,
                ),
              ),
              const SizedBox(height: 24),

              // Instructions list
              ..._instructions.asMap().entries.map((entry) {
                final index = entry.key;
                final instruction = entry.value;
                final isExpanded = _expandedIndex == index;

                return _buildInstructionCard(
                  instruction,
                  isExpanded,
                  () {
                    setState(() {
                      _expandedIndex = isExpanded ? null : index;
                    });
                  },
                );
              }).toList(),
            ],
          ),
        ),
      ),
    );
  }

  /// Build instruction card
  Widget _buildInstructionCard(
    _InstructionItem instruction,
    bool isExpanded,
    VoidCallback onTap,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    // Icon
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        instruction.icon,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Title
                    Expanded(
                      child: Text(
                        instruction.title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.grey900,
                        ),
                      ),
                    ),

                    // Expand icon
                    Icon(
                      isExpanded
                          ? Icons.expand_less
                          : Icons.expand_more,
                      color: AppColors.grey600,
                    ),
                  ],
                ),

                // Steps (when expanded)
                if (isExpanded) ...[
                  const SizedBox(height: 16),
                  Container(
                    height: 1,
                    color: AppColors.grey200,
                  ),
                  const SizedBox(height: 16),
                  ..._buildStepsList(instruction.steps),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Build steps list
  List<Widget> _buildStepsList(List<String> steps) {
    return steps.asMap().entries.map((entry) {
      final stepNumber = entry.key + 1;
      final stepText = entry.value;
      final isLast = stepNumber == steps.length;

      return Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Step number
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    '$stepNumber',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Step text
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Text(
                    stepText,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.grey700,
                      height: 1.4,
                    ),
                  ),
                ),
              ),
            ],
          ),
          if (!isLast)
            Padding(
              padding: const EdgeInsets.only(left: 16, top: 12, bottom: 12),
              child: Container(
                width: 1,
                height: 16,
                color: AppColors.grey300,
              ),
            ),
        ],
      );
    }).toList();
  }
}

/// Instruction item model
class _InstructionItem {
  final String title;
  final IconData icon;
  final List<String> steps;

  _InstructionItem({
    required this.title,
    required this.icon,
    required this.steps,
  });
}
