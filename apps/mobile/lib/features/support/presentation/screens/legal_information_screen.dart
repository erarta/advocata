import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

/// Legal information screen
class LegalInformationScreen extends StatelessWidget {
  const LegalInformationScreen({super.key});

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
          'Юридическая информация',
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
                'Правовые документы сервиса',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.grey900,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Ознакомитесь с основными правовыми документами нашего сервиса',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.grey600,
                ),
              ),
              const SizedBox(height: 24),

              // Terms of Service
              _buildDocumentCard(
                title: 'Условия использования',
                subtitle: 'Основные правила пользования сервисом',
                icon: Icons.description_outlined,
                onTap: () => _showDocumentPreview(context, 'Условия использования'),
              ),

              // Privacy Policy
              _buildDocumentCard(
                title: 'Политика конфиденциальности',
                subtitle: 'Как мы защищаем вашу личную информацию',
                icon: Icons.shield_outlined,
                onTap: () => _showDocumentPreview(context, 'Политика конфиденциальности'),
              ),

              // User Agreement
              _buildDocumentCard(
                title: 'Пользовательское соглашение',
                subtitle: 'Соглашение между сервисом и пользователем',
                icon: Icons.edit_document_outlined,
                onTap: () => _showDocumentPreview(context, 'Пользовательское соглашение'),
              ),

              // Cookie Policy
              _buildDocumentCard(
                title: 'Политика использования cookies',
                subtitle: 'Информация об использовании файлов cookies',
                icon: Icons.info_outlined,
                onTap: () => _showDocumentPreview(context, 'Политика использования cookies'),
              ),

              // Legal Rights
              _buildDocumentCard(
                title: 'Права и обязанности',
                subtitle: 'Ваши права и обязанности при использовании сервиса',
                icon: Icons.gavel_outlined,
                onTap: () => _showDocumentPreview(context, 'Права и обязанности'),
              ),

              // Disclaimer
              _buildDocumentCard(
                title: 'Дисклеймер',
                subtitle: 'Ограничение ответственности сервиса',
                icon: Icons.warning_outlined,
                onTap: () => _showDocumentPreview(context, 'Дисклеймер'),
              ),

              const SizedBox(height: 24),

              // Important information
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF3CD),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: const Color(0xFFFFEBA7),
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.info_outlined,
                          color: Color(0xFF856404),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Text(
                            'Важная информация',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF856404),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Консультация у адвоката на нашей платформе не является подменой очной консультации с юристом. Полная юридическая помощь требует очного приема и изучения документов.',
                      style: TextStyle(
                        fontSize: 13,
                        color: const Color(0xFF856404),
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Build document card
  Widget _buildDocumentCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
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
            child: Row(
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
                    icon,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),

                // Title and subtitle
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: AppColors.grey900,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.grey600,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // Arrow
                const Icon(
                  Icons.chevron_right,
                  color: AppColors.grey400,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Show document preview dialog
  void _showDocumentPreview(BuildContext context, String documentTitle) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.9,
        minChildSize: 0.5,
        builder: (context, scrollController) => Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    documentTitle,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: AppColors.grey900,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            Divider(color: AppColors.grey200),

            // Content
            Expanded(
              child: SingleChildScrollView(
                controller: scrollController,
                padding: const EdgeInsets.all(16),
                child: Text(
                  _getDocumentContent(documentTitle),
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.grey800,
                    height: 1.6,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Get document content placeholder
  String _getDocumentContent(String documentTitle) {
    switch (documentTitle) {
      case 'Условия использования':
        return '''Условия использования сервиса Advocata

1. Общие положения
Сервис Advocata предоставляет платформу для связи клиентов с квалифицированными адвокатами и юристами.

2. Права и обязанности пользователей
Пользователь обязуется использовать сервис в соответствии с действующим законодательством Российской Федерации.

3. Услуги
Сервис предоставляет услуги онлайн-консультаций, видеозвонков и чат-поддержки.

4. Оплата
Все услуги платные. Цены указаны на сайте и могут изменяться.

5. Ответственность
Сервис не несет ответственность за качество услуг адвокатов.

6. Конфиденциальность
Все данные пользователя защищены в соответствии с законодательством о защите персональных данных.

7. Изменения условий
Сервис оставляет право изменять условия использования.

8. Расторжение
Любая из сторон может расторгнуть соглашение в любой момент.''';
      case 'Политика конфиденциальности':
        return '''Политика конфиденциальности

1. Сбор информации
Мы собираем информацию, которую вы предоставляете при регистрации и использовании сервиса.

2. Использование информации
Ваша информация используется для предоставления услуг и улучшения качества сервиса.

3. Защита данных
Мы используем современные технологии шифрования для защиты ваших данных.

4. Передача данных
Мы не передаём ваши личные данные третьим лицам без вашего согласия.

5. Ваши права
Вы имеете право на доступ, изменение и удаление своих данных.

6. Контакты
Если у вас есть вопросы о конфиденциальности, свяжитесь с нами.''';
      default:
        return '''$documentTitle

[Содержание документа будет отображено здесь]

Полный текст документа можно запросить у поддержки сервиса.

Контакты для связи:
- Телефон: 8 (800) 600-18-08
- Email: support@advocata.ru
- Чат: в приложении''';
    }
  }
}
