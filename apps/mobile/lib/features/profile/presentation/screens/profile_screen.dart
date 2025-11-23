import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/profile_providers.dart';
import '../providers/profile_state.dart';
import '../widgets/profile_avatar.dart';
import '../widgets/profile_completion_card.dart';
import '../widgets/profile_menu_item.dart';

/// Profile screen
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  @override
  void initState() {
    super.initState();
    // Load profile when screen is initialized
    Future.microtask(() {
      ref.read(profileNotifierProvider.notifier).loadProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileNotifierProvider);
    final userAsync = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.grey50,
      body: profileState.when(
        initial: () => const Center(child: CircularProgressIndicator()),
        loading: () => const Center(child: CircularProgressIndicator()),
        loaded: (profile) => _buildProfileContent(context, profile),
        updating: () => const Center(child: CircularProgressIndicator()),
        error: (message) => _buildErrorState(context, message),
      ),
    );
  }

  Widget _buildProfileContent(BuildContext context, profile) {
    return CustomScrollView(
      slivers: [
        // App Bar with gradient
        SliverAppBar(
          expandedHeight: 200.0,
          pinned: true,
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: const BoxDecoration(
                gradient: AppColors.primaryGradient,
              ),
              child: SafeArea(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 60),
                    ProfileAvatar(
                      avatarUrl: profile.avatarUrl,
                      initials: profile.initials,
                      size: 80,
                      onTap: () => _handleAvatarTap(context),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      profile.fullName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      profile.phoneNumber,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // Content
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Profile Completion Card
                ProfileCompletionCard(
                  percentage: profile.completionPercentage,
                  onTap: () => context.push('/profile/edit'),
                ),

                const SizedBox(height: 24),

                // Account Section
                _buildSectionTitle('Аккаунт'),
                const SizedBox(height: 8),
                _buildMenuCard([
                  ProfileMenuItem(
                    icon: Icons.person_outline,
                    title: 'Личные данные',
                    onTap: () => context.push('/profile/edit'),
                  ),
                  ProfileMenuItem(
                    icon: Icons.notifications_outline,
                    title: 'Уведомления',
                    onTap: () => context.push('/profile/notifications'),
                  ),
                  ProfileMenuItem(
                    icon: Icons.lock_outline,
                    title: 'Безопасность',
                    onTap: () => context.push('/profile/security'),
                  ),
                ]),

                const SizedBox(height: 24),

                // Quick Actions Section
                _buildSectionTitle('Быстрые действия'),
                const SizedBox(height: 8),
                _buildMenuCard([
                  ProfileMenuItem(
                    icon: Icons.location_on_outlined,
                    title: 'Мои адреса',
                    subtitle: 'Сохраненные места',
                    onTap: () => context.push('/profile/addresses'),
                  ),
                  ProfileMenuItem(
                    icon: Icons.contacts_outlined,
                    title: 'Экстренные контакты',
                    subtitle: 'Доверенные лица',
                    onTap: () => context.push('/profile/emergency-contacts'),
                  ),
                  ProfileMenuItem(
                    icon: Icons.card_giftcard_rounded,
                    title: 'Пригласить друга',
                    subtitle: 'Получите бонусы',
                    onTap: () => context.push('/profile/referral'),
                  ),
                ]),

                const SizedBox(height: 24),

                // App Section
                _buildSectionTitle('Приложение'),
                const SizedBox(height: 8),
                _buildMenuCard([
                  ProfileMenuItem(
                    icon: Icons.settings_outlined,
                    title: 'Настройки',
                    onTap: () => context.push('/profile/settings'),
                  ),
                  ProfileMenuItem(
                    icon: Icons.support_agent,
                    title: 'Поддержка',
                    onTap: () => context.push('/support'),
                  ),
                  ProfileMenuItem(
                    icon: Icons.description_outlined,
                    title: 'Условия использования',
                    onTap: () => context.push('/terms'),
                  ),
                  ProfileMenuItem(
                    icon: Icons.privacy_tip_outlined,
                    title: 'Политика конфиденциальности',
                    onTap: () => context.push('/privacy'),
                  ),
                ]),

                const SizedBox(height: 24),

                // Danger Zone
                _buildMenuCard([
                  ProfileMenuItem(
                    icon: Icons.logout,
                    title: 'Выйти',
                    iconColor: AppColors.error,
                    titleColor: AppColors.error,
                    onTap: () => _handleSignOut(context),
                  ),
                  ProfileMenuItem(
                    icon: Icons.delete_outline,
                    title: 'Удалить аккаунт',
                    iconColor: AppColors.error,
                    titleColor: AppColors.error,
                    onTap: () => _handleDeleteAccount(context),
                  ),
                ]),

                const SizedBox(height: 32),

                // App Version
                Center(
                  child: Text(
                    'Версия 1.0.0',
                    style: TextStyle(
                      color: AppColors.grey500,
                      fontSize: 12,
                    ),
                  ),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ],
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

  Widget _buildMenuCard(List<ProfileMenuItem> items) {
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
        children: items.map((item) {
          final isLast = item == items.last;
          return Column(
            children: [
              item,
              if (!isLast)
                Divider(
                  height: 1,
                  thickness: 1,
                  color: AppColors.grey200,
                  indent: 56,
                ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: AppColors.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Ошибка загрузки профиля',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: TextStyle(
              color: AppColors.grey600,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              ref.read(profileNotifierProvider.notifier).loadProfile();
            },
            child: const Text('Попробовать снова'),
          ),
        ],
      ),
    );
  }

  void _handleAvatarTap(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera),
              title: const Text('Сделать фото'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement camera
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Выбрать из галереи'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement gallery picker
              },
            ),
            ListTile(
              leading: const Icon(Icons.delete),
              title: const Text('Удалить фото'),
              onTap: () {
                Navigator.pop(context);
                // TODO: Implement delete avatar
              },
            ),
          ],
        ),
      ),
    );
  }

  void _handleLanguageChange(BuildContext context) {
    // TODO: Implement language selection
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Функция в разработке')),
    );
  }

  Future<void> _handleSignOut(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Выход'),
        content: const Text('Вы действительно хотите выйти?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Выйти'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final result = await ref.read(authRepositoryProvider).signOut();
      result.fold(
        onSuccess: (_) => context.go('/login'),
        onFailure: (failure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(failure.message)),
          );
        },
      );
    }
  }

  Future<void> _handleDeleteAccount(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Удалить аккаунт'),
        content: const Text(
          'Вы действительно хотите удалить аккаунт? Это действие нельзя отменить.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Удалить'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final success =
          await ref.read(profileNotifierProvider.notifier).deleteAccount();
      if (success && mounted) {
        context.go('/login');
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Не удалось удалить аккаунт')),
        );
      }
    }
  }
}
