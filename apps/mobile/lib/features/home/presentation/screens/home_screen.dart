import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/presentation/theme/app_colors.dart';
import '../../../../core/presentation/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/widgets.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../lawyer/domain/entities/lawyer_entity.dart';
import '../../../lawyer/presentation/providers/lawyer_providers.dart';
import '../../../lawyer/presentation/widgets/lawyer_card.dart';

/// Home screen with recommendations and quick actions
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentUserAsync = ref.watch(currentUserProvider);
    final topRatedLawyersAsync = ref.watch(topRatedLawyersProvider);

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(topRatedLawyersProvider);
          },
          child: CustomScrollView(
            slivers: [
              // Header with user greeting
              SliverToBoxAdapter(
                child: _buildHeader(context, currentUserAsync.value),
              ),

              // Quick actions
              SliverToBoxAdapter(
                child: _buildQuickActions(context),
              ),

              // Emergency banner
              SliverToBoxAdapter(
                child: _buildEmergencyBanner(context),
              ),

              // Top rated lawyers section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Text(
                        'Топ юристы',
                        style: AppTextStyles.headingLarge,
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () {
                          context.pushNamed('lawyers');
                        },
                        child: const Text('Все юристы'),
                      ),
                    ],
                  ),
                ),
              ),

              // Lawyers list
              topRatedLawyersAsync.when(
                data: (lawyers) => _buildLawyersList(context, lawyers),
                loading: () => const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: LoadingIndicator(),
                  ),
                ),
                error: (error, stack) => SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: ErrorState(
                      message: error.toString(),
                      onRetry: () {
                        ref.invalidate(topRatedLawyersProvider);
                      },
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, dynamic user) {
    final userName = user?.firstName ?? 'Пользователь';

    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Привет, $userName!',
                      style: AppTextStyles.displayMedium.copyWith(
                        color: AppColors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Найдите юриста для вашей ситуации',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.white.withOpacity(0.9),
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
                  color: AppColors.white,
                  size: 32,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    final actions = [
      _QuickAction(
        icon: Icons.search_rounded,
        label: 'Найти юриста',
        color: AppColors.primary,
        onTap: () => context.pushNamed('lawyers'),
      ),
      _QuickAction(
        icon: Icons.emergency_rounded,
        label: 'Экстренная помощь',
        color: AppColors.error,
        onTap: () {
          // TODO: Implement emergency consultation
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Функция в разработке'),
            ),
          );
        },
      ),
      _QuickAction(
        icon: Icons.chat_rounded,
        label: 'Чат-бот',
        color: AppColors.info,
        onTap: () {
          // TODO: Implement chatbot
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Чат-бот скоро будет доступен'),
            ),
          );
        },
      ),
      _QuickAction(
        icon: Icons.history_rounded,
        label: 'История',
        color: AppColors.success,
        onTap: () {
          // TODO: Implement consultation history
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Функция в разработке'),
            ),
          );
        },
      ),
    ];

    return Padding(
      padding: const EdgeInsets.all(16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 1.5,
        ),
        itemCount: actions.length,
        itemBuilder: (context, index) {
          final action = actions[index];
          return _buildQuickActionCard(action);
        },
      ),
    );
  }

  Widget _buildQuickActionCard(_QuickAction action) {
    return GradientCard(
      gradient: LinearGradient(
        colors: [
          action.color,
          action.color.withOpacity(0.7),
        ],
      ),
      onTap: action.onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            action.icon,
            color: AppColors.white,
            size: 32,
          ),
          const SizedBox(height: 8),
          Text(
            action.label,
            style: AppTextStyles.titleSmall.copyWith(
              color: AppColors.white,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildEmergencyBanner(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: InfoCard(
        backgroundColor: AppColors.error.withOpacity(0.1),
        padding: const EdgeInsets.all(16),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: AppColors.error,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(
            Icons.warning_rounded,
            color: AppColors.white,
            size: 28,
          ),
        ),
        title: 'Нужна срочная помощь?',
        subtitle: 'Свяжитесь с юристом прямо сейчас для экстренной консультации',
        trailing: const Icon(
          Icons.arrow_forward_rounded,
          color: AppColors.error,
        ),
        onTap: () {
          // TODO: Implement emergency consultation
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Функция экстренной консультации в разработке'),
              backgroundColor: AppColors.error,
            ),
          );
        },
      ),
    );
  }

  Widget _buildLawyersList(BuildContext context, List<LawyerEntity> lawyers) {
    if (lawyers.isEmpty) {
      return SliverToBoxAdapter(
        child: EmptyState(
          icon: Icons.people_outline_rounded,
          title: 'Юристы не найдены',
          subtitle: 'Попробуйте обновить страницу',
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final lawyer = lawyers[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: LawyerCard(
                lawyer: lawyer,
                onTap: () {
                  context.pushNamed('lawyer-detail', pathParameters: {
                    'id': lawyer.id,
                  });
                },
              ),
            );
          },
          childCount: lawyers.length > 5 ? 5 : lawyers.length,
        ),
      ),
    );
  }
}

class _QuickAction {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  _QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });
}
