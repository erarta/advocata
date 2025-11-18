import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/presentation/theme/app_colors.dart';
import '../../../../core/presentation/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/widgets.dart';
import '../../domain/entities/lawyer_entity.dart';
import '../providers/lawyer_providers.dart';

/// Lawyer detail screen
class LawyerDetailScreen extends ConsumerWidget {
  final String lawyerId;

  const LawyerDetailScreen({
    super.key,
    required this.lawyerId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lawyerAsync = ref.watch(lawyerByIdProvider(lawyerId));

    return lawyerAsync.when(
      data: (lawyer) => Scaffold(
        body: _buildContent(context, lawyer),
        floatingActionButton: _buildBookingButton(context, lawyer),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      ),
      loading: () => const Scaffold(
        body: LoadingIndicator(),
      ),
      error: (error, stack) => Scaffold(
        appBar: AppBar(),
        body: ErrorState(
          message: error.toString(),
          onRetry: () {
            ref.invalidate(lawyerByIdProvider(lawyerId));
          },
        ),
      ),
    );
  }

  Widget _buildBookingButton(BuildContext context, LawyerEntity lawyer) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      width: double.infinity,
      height: 56,
      child: FloatingActionButton.extended(
        onPressed: () {
          context.push('/consultations/book', extra: lawyer);
        },
        backgroundColor: AppColors.primary,
        elevation: 8,
        label: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.calendar_today, size: 20),
            const SizedBox(width: 12),
            Text(
              'Забронировать консультацию',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              '${lawyer.hourlyRate.toStringAsFixed(0)} ₽/час',
              style: const TextStyle(
                fontSize: 14,
                color: Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, LawyerEntity lawyer) {
    return CustomScrollView(
      slivers: [
        // App bar with lawyer avatar
        _buildSliverAppBar(context, lawyer),

        // Content
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Name and basic info
              _buildHeader(lawyer),

              const Divider(height: 32),

              // Specializations
              _buildSection(
                title: 'Специализация',
                child: _buildSpecializations(lawyer),
              ),

              // Bio
              if (lawyer.bio != null) ...[
                const Divider(height: 32),
                _buildSection(
                  title: 'О себе',
                  child: Text(
                    lawyer.bio!,
                    style: AppTextStyles.bodyMedium,
                  ),
                ),
              ],

              // Education
              if (lawyer.education != null) ...[
                const Divider(height: 32),
                _buildSection(
                  title: 'Образование',
                  child: Text(
                    lawyer.education!,
                    style: AppTextStyles.bodyMedium,
                  ),
                ),
              ],

              // Stats
              const Divider(height: 32),
              _buildStats(lawyer),

              const SizedBox(height: 100), // Space for floating button
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSliverAppBar(BuildContext context, LawyerEntity lawyer) {
    return SliverAppBar(
      expandedHeight: 200,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: AppColors.heroGradient,
          ),
          child: Center(
            child: AvatarWidget(
              imageUrl: lawyer.avatarUrl,
              name: lawyer.fullName,
              size: 100,
              showBorder: true,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(LawyerEntity lawyer) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Name
          Text(
            lawyer.fullName,
            style: AppTextStyles.displayMedium,
          ),

          const SizedBox(height: 8),

          // License number
          Text(
            'Лицензия №${lawyer.licenseNumber}',
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.grey600,
            ),
          ),

          const SizedBox(height: 16),

          // Rating and experience
          Row(
            children: [
              // Rating
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.star_rounded,
                      color: AppColors.warning,
                      size: 20,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      lawyer.rating.toStringAsFixed(1),
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '(${lawyer.reviewCount})',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 12),

              // Experience
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.workspace_premium_rounded,
                      color: AppColors.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${lawyer.yearsOfExperience} ${_pluralizeYears(lawyer.yearsOfExperience)}',
                      style: AppTextStyles.titleSmall.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Availability
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: lawyer.isAvailable
                      ? AppColors.success.withOpacity(0.1)
                      : AppColors.grey200,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: lawyer.isAvailable
                            ? AppColors.success
                            : AppColors.grey500,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      lawyer.isAvailable ? 'Онлайн' : 'Занят',
                      style: AppTextStyles.labelSmall.copyWith(
                        color: lawyer.isAvailable
                            ? AppColors.success
                            : AppColors.grey600,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required Widget child,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.headingMedium,
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }

  Widget _buildSpecializations(LawyerEntity lawyer) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: lawyer.specializations.map((spec) {
        final displayName = _getSpecializationDisplayName(spec);
        return Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 8,
          ),
          decoration: BoxDecoration(
            color: AppColors.primaryLight.withOpacity(0.2),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            displayName,
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildStats(LawyerEntity lawyer) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Статистика',
            style: AppTextStyles.headingMedium,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  icon: Icons.star_rounded,
                  label: 'Рейтинг',
                  value: lawyer.rating.toStringAsFixed(1),
                  color: AppColors.warning,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  icon: Icons.rate_review_rounded,
                  label: 'Отзывов',
                  value: lawyer.reviewCount.toString(),
                  color: AppColors.info,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  icon: Icons.workspace_premium_rounded,
                  label: 'Опыт',
                  value: '${lawyer.yearsOfExperience} ${_pluralizeYearsShort(lawyer.yearsOfExperience)}',
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            color: color,
            size: 32,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.headingLarge.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: AppColors.grey600,
            ),
          ),
        ],
      ),
    );
  }

  String _getSpecializationDisplayName(String key) {
    try {
      return SpecializationType.fromKey(key).displayName;
    } catch (e) {
      return key;
    }
  }

  String _pluralizeYears(int years) {
    if (years % 10 == 1 && years % 100 != 11) {
      return 'год опыта';
    } else if ([2, 3, 4].contains(years % 10) &&
        ![12, 13, 14].contains(years % 100)) {
      return 'года опыта';
    } else {
      return 'лет опыта';
    }
  }

  String _pluralizeYearsShort(int years) {
    if (years % 10 == 1 && years % 100 != 11) {
      return 'год';
    } else if ([2, 3, 4].contains(years % 10) &&
        ![12, 13, 14].contains(years % 100)) {
      return 'года';
    } else {
      return 'лет';
    }
  }
}
