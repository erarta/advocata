import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/presentation/theme/app_colors.dart';
import '../../../../core/presentation/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/widgets.dart';
import '../../../auth/presentation/providers/auth_providers.dart';

/// Home screen with new design matching Figma
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUserAsync = ref.watch(currentUserProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(currentUserProvider);
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              children: [
                // Header with user greeting
                _buildHeader(context, currentUserAsync.value),

                // Main content grid
                _buildMainGrid(context),

                // Extra spacing at bottom
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, dynamic user) {
    final userName = user?.firstName ?? 'Пользователь';
    final greeting = _getTimeBasedGreeting();

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$greeting, $userName 👋',
                  style: AppTextStyles.displaySmall.copyWith(
                    color: AppColors.onBackground,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Найдите важную информацию',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () {
              context.pushNamed('profile');
            },
            icon: const Icon(
              Icons.account_circle_rounded,
              color: AppColors.onBackground,
              size: 32,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMainGrid(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Row 1: Consultation + Emergency Call
          Row(
            children: [
              Expanded(
                child: _buildMainCard(
                  context: context,
                  icon: '👥',
                  title: 'Консультация',
                  onTap: () => context.pushNamed('lawyers'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMainCard(
                  context: context,
                  icon: '⚡',
                  title: 'Вызов',
                  onTap: () => context.pushNamed('emergency-call'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Row 2: Subscription Banner (full width)
          _buildSubscriptionBanner(context),
          const SizedBox(height: 12),

          // Row 3: Templates + Lawyer Catalog
          Row(
            children: [
              Expanded(
                child: _buildMainCard(
                  context: context,
                  icon: '📄',
                  title: 'Шаблоны',
                  onTap: () => context.pushNamed('documents-templates'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildMainCard(
                  context: context,
                  icon: '👨‍⚖️',
                  title: 'Каталог\nадвокатов',
                  onTap: () => context.pushNamed('lawyers'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMainCard({
    required BuildContext context,
    required String icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return GradientCard(
      gradient: AppColors.coralGradient,
      onTap: onTap,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            icon,
            style: const TextStyle(fontSize: 32),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: AppTextStyles.titleMedium.copyWith(
              color: AppColors.white,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildSubscriptionBanner(BuildContext context) {
    return GestureDetector(
      onTap: () => context.pushNamed('subscription-plans'),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.grey800,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.shadow,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Купить подписку',
              style: AppTextStyles.titleMedium.copyWith(
                color: AppColors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Весь функционал в одной подписке',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.grey400,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getTimeBasedGreeting() {
    final hour = DateTime.now().hour;

    if (hour >= 5 && hour < 12) {
      return 'Доброе утро';
    } else if (hour >= 12 && hour < 18) {
      return 'Добрый день';
    } else if (hour >= 18 && hour < 23) {
      return 'Добрый вечер';
    } else {
      return 'Доброй ночи';
    }
  }
}
