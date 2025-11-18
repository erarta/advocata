import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../../../../core/presentation/theme/app_colors.dart';
import '../../../../core/presentation/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/widgets.dart';
import '../../domain/entities/lawyer_entity.dart';

/// Lawyer card widget
class LawyerCard extends StatelessWidget {
  final LawyerEntity lawyer;
  final VoidCallback? onTap;

  const LawyerCard({
    super.key,
    required this.lawyer,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InfoCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      leading: AvatarWidget(
        imageUrl: lawyer.avatarUrl,
        name: lawyer.fullName,
        size: 56,
        showBorder: true,
      ),
      title: lawyer.shortName,
      subtitle: _buildSubtitle(),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          _buildRating(),
          const SizedBox(height: 4),
          _buildAvailability(),
        ],
      ),
    );
  }

  Widget _buildSubtitle() {
    final specialization = lawyer.specializations.isNotEmpty
        ? _getSpecializationDisplayName(lawyer.specializations.first)
        : 'Юрист';

    final experience = '${lawyer.yearsOfExperience} ${_pluralizeYears(lawyer.yearsOfExperience)}';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          specialization,
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.grey700,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          'Опыт: $experience',
          style: AppTextStyles.caption.copyWith(
            color: AppColors.grey600,
          ),
        ),
      ],
    );
  }

  Widget _buildRating() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        RatingBarIndicator(
          rating: lawyer.rating,
          itemBuilder: (context, index) => const Icon(
            Icons.star_rounded,
            color: AppColors.warning,
          ),
          itemCount: 5,
          itemSize: 16,
        ),
        const SizedBox(width: 4),
        Text(
          lawyer.rating.toStringAsFixed(1),
          style: AppTextStyles.labelSmall.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildAvailability() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: lawyer.isAvailable
            ? AppColors.success.withOpacity(0.1)
            : AppColors.grey200,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: lawyer.isAvailable ? AppColors.success : AppColors.grey500,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            lawyer.isAvailable ? 'Онлайн' : 'Занят',
            style: AppTextStyles.caption.copyWith(
              color: lawyer.isAvailable ? AppColors.success : AppColors.grey600,
              fontWeight: FontWeight.w600,
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
      return 'год';
    } else if ([2, 3, 4].contains(years % 10) &&
        ![12, 13, 14].contains(years % 100)) {
      return 'года';
    } else {
      return 'лет';
    }
  }
}
