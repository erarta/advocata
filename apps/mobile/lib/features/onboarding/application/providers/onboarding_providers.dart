import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/infrastructure/storage/local_storage.dart';
import '../../data/onboarding_content.dart';
import '../../domain/entities/onboarding_page.entity.dart';

/// Current onboarding page index provider (0-23)
final onboardingPageIndexProvider = StateProvider<int>((ref) => 0);

/// Current onboarding page entity provider
final currentOnboardingPageProvider = Provider<OnboardingPageEntity>((ref) {
  final index = ref.watch(onboardingPageIndexProvider);
  return OnboardingContent.pages[index];
});

/// All onboarding pages provider
final onboardingPagesProvider =
    Provider<List<OnboardingPageEntity>>((ref) => OnboardingContent.pages);

/// Total pages count provider
final onboardingTotalPagesProvider =
    Provider<int>((ref) => OnboardingContent.totalPages);

/// Onboarding completion status provider
final onboardingCompletedProvider = StateProvider<bool>((ref) {
  return LocalStorage.getBool(StorageKeys.onboardingCompleted) ?? false;
});

/// Service for onboarding operations
class OnboardingService {
  OnboardingService._();

  /// Mark onboarding as completed
  static Future<void> completeOnboarding() async {
    await LocalStorage.setBool(StorageKeys.onboardingCompleted, true);
  }

  /// Check if onboarding is completed
  static bool isOnboardingCompleted() {
    return LocalStorage.getBool(StorageKeys.onboardingCompleted) ?? false;
  }

  /// Reset onboarding (for testing)
  static Future<void> resetOnboarding() async {
    await LocalStorage.setBool(StorageKeys.onboardingCompleted, false);
  }
}
