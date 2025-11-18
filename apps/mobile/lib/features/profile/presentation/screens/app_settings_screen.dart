import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../application/providers/settings_providers.dart';
import '../../domain/entities/app_settings.entity.dart';

/// App settings screen
class AppSettingsScreen extends ConsumerWidget {
  const AppSettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settingsAsync = ref.watch(appSettingsProvider);
    final cacheSizeAsync = ref.watch(cacheSizeProvider);

    return Scaffold(
      backgroundColor: AppColors.grey50,
      appBar: AppBar(
        title: const Text('Настройки'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: AppColors.grey900,
      ),
      body: settingsAsync.when(
        data: (settings) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Appearance section
            _buildSectionTitle('Внешний вид'),
            const SizedBox(height: 8),
            _buildSettingsCard([
              _buildThemeTile(context, ref, settings),
              _buildLanguageTile(context, ref, settings),
            ]),

            const SizedBox(height: 24),

            // Notifications section
            _buildSectionTitle('Уведомления'),
            const SizedBox(height: 8),
            _buildSettingsCard([
              _buildNotificationTile(
                'Push-уведомления',
                'Получать уведомления в приложении',
                settings.notifications.pushEnabled,
                (value) => _updateNotifications(
                  ref,
                  settings.notifications.copyWith(pushEnabled: value),
                ),
              ),
              _buildNotificationTile(
                'SMS-уведомления',
                'Получать SMS о консультациях',
                settings.notifications.smsEnabled,
                (value) => _updateNotifications(
                  ref,
                  settings.notifications.copyWith(smsEnabled: value),
                ),
              ),
              _buildNotificationTile(
                'Email-уведомления',
                'Получать письма на почту',
                settings.notifications.emailEnabled,
                (value) => _updateNotifications(
                  ref,
                  settings.notifications.copyWith(emailEnabled: value),
                ),
              ),
              _buildNotificationTile(
                'Напоминания о консультациях',
                'Уведомления за 1 час до встречи',
                settings.notifications.consultationReminders,
                (value) => _updateNotifications(
                  ref,
                  settings.notifications.copyWith(consultationReminders: value),
                ),
              ),
              _buildNotificationTile(
                'Платежные уведомления',
                'Уведомления о платежах',
                settings.notifications.paymentNotifications,
                (value) => _updateNotifications(
                  ref,
                  settings.notifications.copyWith(paymentNotifications: value),
                ),
              ),
              _buildNotificationTile(
                'Маркетинговые уведомления',
                'Акции и специальные предложения',
                settings.notifications.marketingNotifications,
                (value) => _updateNotifications(
                  ref,
                  settings.notifications.copyWith(marketingNotifications: value),
                ),
              ),
            ]),

            const SizedBox(height: 24),

            // Security section
            _buildSectionTitle('Безопасность'),
            const SizedBox(height: 8),
            _buildSettingsCard([
              SwitchListTile(
                title: const Text('Биометрическая аутентификация'),
                subtitle: const Text('Вход по отпечатку пальца или Face ID'),
                value: settings.biometricEnabled,
                onChanged: (value) {
                  ref.read(settingsOperationsProvider.notifier).updateBiometric(value);
                },
                activeColor: AppColors.primary,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
            ]),

            const SizedBox(height: 24),

            // Privacy section
            _buildSectionTitle('Конфиденциальность'),
            const SizedBox(height: 8),
            _buildSettingsCard([
              SwitchListTile(
                title: const Text('Аналитика'),
                subtitle: const Text('Помогать улучшать приложение'),
                value: settings.analyticsEnabled,
                onChanged: (value) {
                  ref.read(settingsOperationsProvider.notifier).updateAnalytics(value);
                },
                activeColor: AppColors.primary,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
              SwitchListTile(
                title: const Text('Отчеты об ошибках'),
                subtitle: const Text('Автоматически отправлять отчеты'),
                value: settings.crashReportingEnabled,
                onChanged: (value) {
                  ref
                      .read(settingsOperationsProvider.notifier)
                      .updateCrashReporting(value);
                },
                activeColor: AppColors.primary,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
            ]),

            const SizedBox(height: 24),

            // Storage section
            _buildSectionTitle('Хранилище'),
            const SizedBox(height: 8),
            _buildSettingsCard([
              ListTile(
                title: const Text('Размер кеша'),
                subtitle: cacheSizeAsync.when(
                  data: (size) => Text('${size.toStringAsFixed(2)} МБ'),
                  loading: () => const Text('Вычисление...'),
                  error: (_, __) => const Text('Ошибка'),
                ),
                trailing: TextButton(
                  onPressed: () => _clearCache(context, ref),
                  child: const Text('Очистить'),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
            ]),

            const SizedBox(height: 24),

            // About section
            _buildSectionTitle('О приложении'),
            const SizedBox(height: 8),
            _buildSettingsCard([
              const ListTile(
                title: Text('Версия'),
                subtitle: Text('1.0.0 (Build 1)'),
                trailing: Text(
                  'Актуальная',
                  style: TextStyle(color: AppColors.success),
                ),
                contentPadding: EdgeInsets.symmetric(horizontal: 16),
              ),
            ]),

            const SizedBox(height: 32),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Ошибка загрузки настроек: $error'),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.grey700,
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Container(
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
      child: Column(
        children: children.map((child) {
          final isLast = child == children.last;
          return Column(
            children: [
              child,
              if (!isLast)
                Divider(
                  height: 1,
                  thickness: 1,
                  color: AppColors.grey200,
                  indent: 16,
                  endIndent: 16,
                ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildThemeTile(
      BuildContext context, WidgetRef ref, AppSettingsEntity settings) {
    return ListTile(
      title: const Text('Тема'),
      subtitle: Text(settings.themeMode.displayName),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => _showThemeDialog(context, ref, settings.themeMode),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
    );
  }

  Widget _buildLanguageTile(
      BuildContext context, WidgetRef ref, AppSettingsEntity settings) {
    return ListTile(
      title: const Text('Язык'),
      subtitle: Text(settings.language.displayName),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => _showLanguageDialog(context, ref, settings.language),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
    );
  }

  Widget _buildNotificationTile(
    String title,
    String subtitle,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return SwitchListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      value: value,
      onChanged: onChanged,
      activeColor: AppColors.primary,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16),
    );
  }

  Future<void> _showThemeDialog(
      BuildContext context, WidgetRef ref, ThemeMode current) async {
    final selected = await showDialog<ThemeMode>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Выберите тему'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: ThemeMode.values.map((mode) {
            return RadioListTile<ThemeMode>(
              title: Text(mode.displayName),
              value: mode,
              groupValue: current,
              onChanged: (value) {
                Navigator.pop(context, value);
              },
              activeColor: AppColors.primary,
            );
          }).toList(),
        ),
      ),
    );

    if (selected != null && selected != current) {
      ref.read(settingsOperationsProvider.notifier).updateThemeMode(selected);
    }
  }

  Future<void> _showLanguageDialog(
      BuildContext context, WidgetRef ref, AppLanguage current) async {
    final selected = await showDialog<AppLanguage>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Выберите язык'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: AppLanguage.values.map((lang) {
            return RadioListTile<AppLanguage>(
              title: Text(lang.displayName),
              value: lang,
              groupValue: current,
              onChanged: (value) {
                Navigator.pop(context, value);
              },
              activeColor: AppColors.primary,
            );
          }).toList(),
        ),
      ),
    );

    if (selected != null && selected != current) {
      ref.read(settingsOperationsProvider.notifier).updateLanguage(selected);
    }
  }

  Future<void> _updateNotifications(
      WidgetRef ref, NotificationPreferences notifications) async {
    ref.read(settingsOperationsProvider.notifier).updateNotifications(notifications);
  }

  Future<void> _clearCache(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Очистить кеш'),
        content: const Text(
          'Это удалит все временные файлы и изображения. Продолжить?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Очистить'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      final success =
          await ref.read(settingsOperationsProvider.notifier).clearCache();

      if (success && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Кеш очищен')),
        );
      }
    }
  }
}
