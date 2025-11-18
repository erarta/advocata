import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../widgets/support_option_card.dart';

/// Support screen - main menu with support options
class SupportScreen extends StatelessWidget {
  const SupportScreen({super.key});

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
          'Поддержка',
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
                'Как мы можем вам помочь?',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: AppColors.grey900,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Выберите способ связи с нашей командой поддержки',
                style: TextStyle(
                  fontSize: 14,
                  color: AppColors.grey600,
                ),
              ),
              const SizedBox(height: 24),

              // Phone support option
              SupportOptionCard(
                icon: Icons.phone,
                title: '8 (800) 600-18-08',
                subtitle: 'Единая служба поддержки',
                onTap: () => _makePhoneCall(context),
              ),

              // Chat support option
              SupportOptionCard(
                icon: Icons.chat_bubble_outline,
                title: 'Чат с диспетчером',
                subtitle: 'Любые вопросы по приложению',
                onTap: () => context.push('/support/chat'),
              ),

              // Legal information option
              SupportOptionCard(
                icon: Icons.description_outlined,
                title: 'Юридическая информация',
                subtitle: 'Правовые документы сервиса',
                onTap: () => context.push('/support/legal'),
              ),

              // Instructions/FAQ option
              SupportOptionCard(
                icon: Icons.help_outline,
                title: 'Инструкции',
                subtitle: 'Помощь в разных ситуациях',
                onTap: () => context.push('/support/instructions'),
              ),

              const SizedBox(height: 32),

              // FAQ section
              Text(
                'Часто задаваемые вопросы',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.grey900,
                ),
              ),
              const SizedBox(height: 12),
              _buildFaqCard(
                'Как узнать статус своей консультации?',
                'Откройте раздел "Мои консультации" в главном меню и выберите нужную консультацию.',
              ),
              _buildFaqCard(
                'Как отменить бронирование?',
                'Вы можете отменить консультацию за 30 минут до её начала в разделе "Мои консультации".',
              ),
              _buildFaqCard(
                'Как получить возврат средств?',
                'Если консультация не состоялась, возврат будет произведён автоматически в течение 3-5 рабочих дней.',
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Make phone call
  Future<void> _makePhoneCall(BuildContext context) async {
    final Uri launchUri = Uri(
      scheme: 'tel',
      path: '+78006001808',
    );
    try {
      await launchUrl(launchUri);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Не удалось открыть приложение телефона'),
          ),
        );
      }
    }
  }

  /// Build FAQ card
  Widget _buildFaqCard(String question, String answer) {
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
      child: ExpansionTile(
        title: Text(
          question,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.grey900,
          ),
        ),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        children: [
          Text(
            answer,
            style: TextStyle(
              fontSize: 13,
              color: AppColors.grey700,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
