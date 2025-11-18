import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../application/providers/onboarding_providers.dart';
import '../widgets/onboarding_page_widget.dart';
import '../widgets/page_indicator.dart';

/// Main onboarding screen with 24 informative slides
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int index) {
    ref.read(onboardingPageIndexProvider.notifier).state = index;
  }

  void _nextPage() {
    final currentIndex = ref.read(onboardingPageIndexProvider);
    final totalPages = ref.read(onboardingTotalPagesProvider);

    if (currentIndex < totalPages - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _completeOnboarding();
    }
  }

  void _skipOnboarding() {
    _completeOnboarding();
  }

  Future<void> _completeOnboarding() async {
    // Save completion status
    await OnboardingService.completeOnboarding();

    // Update provider
    ref.read(onboardingCompletedProvider.notifier).state = true;

    if (!mounted) return;

    // Navigate to login or home based on auth status
    // For now, navigate to login
    context.go('/auth/login');
  }

  @override
  Widget build(BuildContext context) {
    final currentPageIndex = ref.watch(onboardingPageIndexProvider);
    final pages = ref.watch(onboardingPagesProvider);
    final totalPages = ref.watch(onboardingTotalPagesProvider);
    final isLastPage = currentPageIndex == totalPages - 1;

    return Scaffold(
      backgroundColor: AppColors.grey900,
      body: Stack(
        children: [
          // PageView
          PageView.builder(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            itemCount: totalPages,
            itemBuilder: (context, index) {
              return OnboardingPageWidget(page: pages[index]);
            },
          ),

          // Top bar with logo and skip button
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Logo
                    RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                        children: [
                          TextSpan(
                            text: 'ADVOC',
                            style: TextStyle(color: Colors.white),
                          ),
                          TextSpan(
                            text: 'ALL',
                            style: TextStyle(color: AppColors.coral),
                          ),
                        ],
                      ),
                    ),

                    // Skip button
                    if (!isLastPage)
                      TextButton(
                        onPressed: _skipOnboarding,
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Text(
                              'Пропустить',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward_ios, size: 14),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom navigation
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      Colors.black.withOpacity(0.3),
                      Colors.black.withOpacity(0.6),
                    ],
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Page indicator
                    PageIndicator(
                      currentPage: currentPageIndex,
                      totalPages: totalPages,
                    ),

                    const SizedBox(height: 24),

                    // Next/Get Started button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _nextPage,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.grey900,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 4,
                        ),
                        child: Text(
                          isLastPage ? 'Начать' : 'Далее',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
