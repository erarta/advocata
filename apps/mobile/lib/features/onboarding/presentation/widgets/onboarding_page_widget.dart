import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/entities/onboarding_page.entity.dart';

/// Widget representing a single onboarding page
class OnboardingPageWidget extends StatelessWidget {
  final OnboardingPageEntity page;

  const OnboardingPageWidget({
    super.key,
    required this.page,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: page.gradientColors != null && page.gradientColors!.length >= 2
            ? LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: page.gradientColors!,
              )
            : null,
        color: page.gradientColors == null ? AppColors.grey900 : null,
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Page number indicator (top left)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.book_outlined,
                      color: Colors.white,
                      size: 16,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      page.progressText,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(flex: 1),

              // Illustration
              Center(
                child: Text(
                  page.illustration,
                  style: const TextStyle(fontSize: 80),
                ),
              ),

              const SizedBox(height: 32),

              // Title
              Text(
                page.title,
                style: const TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: 1.5,
                ),
              ),

              const SizedBox(height: 16),

              // Subtitle
              Text(
                page.subtitle,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                  height: 1.3,
                ),
              ),

              const SizedBox(height: 24),

              // Content
              Text(
                page.content,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withOpacity(0.9),
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 24),

              // Bullet points (if available)
              if (page.bulletPoints != null && page.bulletPoints!.isNotEmpty) ...[
                ...page.bulletPoints!.map((point) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            margin: const EdgeInsets.only(top: 6),
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              point,
                              style: TextStyle(
                                fontSize: 15,
                                color: Colors.white.withOpacity(0.95),
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )),
              ],

              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }
}
