import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Page indicator widget showing current page and total pages
class PageIndicator extends StatelessWidget {
  final int currentPage;
  final int totalPages;

  const PageIndicator({
    super.key,
    required this.currentPage,
    required this.totalPages,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Dots indicator
        SizedBox(
          height: 40,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            shrinkWrap: true,
            itemCount: totalPages,
            itemBuilder: (context, index) {
              final isActive = index == currentPage;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: isActive ? 10 : 6,
                height: isActive ? 10 : 6,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isActive ? AppColors.primary : AppColors.grey400,
                ),
              );
            },
          ),
        ),

        const SizedBox(height: 12),

        // Progress text
        Text(
          '${currentPage + 1} из $totalPages',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.grey700,
          ),
        ),
      ],
    );
  }
}
