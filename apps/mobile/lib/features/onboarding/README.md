# Onboarding Feature - Advocata Mobile App

## Overview

Comprehensive onboarding experience with 24 informative slides introducing users to the Advocata platform's features and capabilities.

## Structure

```
lib/features/onboarding/
├── domain/
│   └── entities/
│       └── onboarding_page.entity.dart     # OnboardingPageEntity model
├── data/
│   └── onboarding_content.dart              # Static content for 24 slides
├── application/
│   └── providers/
│       └── onboarding_providers.dart        # Riverpod providers & service
└── presentation/
    ├── screens/
    │   └── onboarding_screen.dart           # Main onboarding screen
    └── widgets/
        ├── onboarding_page_widget.dart      # Single slide widget
        └── page_indicator.dart              # Page progress indicator
```

## Content Breakdown (24 Slides)

### Block 1: Emergency Assistance (1-4)
1. How to protect yourself during investigative actions
2. What to do in case of a car accident - first steps
3. How to call a lawyer via map
4. Emergency consultation - when it's needed

### Block 2: Consultations (5-8)
5. How to book a consultation
6. Video consultation - how to prepare
7. Chat with lawyer - communication rules
8. How to rate a consultation

### Block 3: Finding a Lawyer (9-12)
9. Lawyer catalog - filters and search
10. Lawyer specializations
11. Ratings and reviews - how to choose
12. Lawyer verification check

### Block 4: Subscriptions (13-16)
13. Subscription plans - comparison
14. How to subscribe
15. Premium subscription benefits
16. How to cancel subscription

### Block 5: Documents & Payment (17-20)
17. Document templates - where to find
18. How to download a document
19. Payment methods
20. Payment security

### Block 6: Additional (21-24)
21. Your profile - settings
22. Notifications and reminders
23. Support - how to contact us
24. Privacy and security

## Features

✅ 24 unique, informative slides in Russian
✅ Full Clean Architecture implementation
✅ Swipeable PageView with smooth animations
✅ Skip button (top-right corner)
✅ Next/Get Started buttons
✅ Animated page indicator with dots
✅ Progress text (e.g., "1 из 24")
✅ Persistent completion state (SharedPreferences)
✅ Dark theme with gradient background
✅ Large emoji illustrations
✅ Bullet points for key information
✅ Riverpod state management

## User Flow

1. **First Launch**: User sees splash screen → Onboarding (if not completed)
2. **Onboarding Navigation**:
   - Swipe left/right to navigate
   - Tap "Далее" to go to next page
   - Tap "Пропустить" to skip onboarding
   - On last page (24), button shows "Начать"
3. **Completion**: Saves completion status → Navigate to Login
4. **Subsequent Launches**: Splash → Login/Home (onboarding skipped)

## Integration Points

### Router Configuration
- Route: `/onboarding`
- Added to `lib/config/router_config.dart`

### Splash Screen Logic
Modified `_navigateToNextScreen()` in `router_config.dart`:
```dart
// Check onboarding status
final onboardingCompleted = OnboardingService.isOnboardingCompleted();

// If onboarding not completed, show onboarding
if (!onboardingCompleted) {
  context.go('/onboarding');
  return;
}
```

### Local Storage
Uses existing `LocalStorage` service and `StorageKeys.onboardingCompleted` constant.

## Usage

### Providers

```dart
// Current page index (0-23)
final index = ref.watch(onboardingPageIndexProvider);

// Current page entity
final page = ref.watch(currentOnboardingPageProvider);

// All pages
final pages = ref.watch(onboardingPagesProvider);

// Total pages count
final total = ref.watch(onboardingTotalPagesProvider);

// Completion status
final completed = ref.watch(onboardingCompletedProvider);
```

### Service Methods

```dart
// Mark onboarding as completed
await OnboardingService.completeOnboarding();

// Check if completed
bool completed = OnboardingService.isOnboardingCompleted();

// Reset (for testing)
await OnboardingService.resetOnboarding();
```

## Testing Checklist

### First Launch Flow
- [ ] Fresh install shows onboarding on first launch
- [ ] Can swipe between all 24 pages
- [ ] Page indicator updates correctly
- [ ] Progress text shows "X из 24" correctly

### Navigation
- [ ] "Далее" button advances to next page
- [ ] "Пропустить" button skips onboarding
- [ ] Last page shows "Начать" instead of "Далее"
- [ ] "Начать" navigates to login screen

### Persistence
- [ ] Completion state is saved
- [ ] Second app launch skips onboarding
- [ ] Goes directly to login/home after splash

### UI/UX
- [ ] All 24 pages have unique content
- [ ] Emoji illustrations display correctly
- [ ] Bullet points are readable
- [ ] Dark background with white text
- [ ] Smooth page transitions
- [ ] Page indicator animation works

### Content Validation
- [ ] All Russian text is correct
- [ ] All bullet points are relevant
- [ ] Content matches design requirements
- [ ] Logo displays correctly ("ADVOC" + "ALL")

## Resetting for Testing

To test onboarding again after completion:

```dart
// In a debug screen or developer menu
await OnboardingService.resetOnboarding();
// Then restart the app
```

Or manually:
```dart
await LocalStorage.setBool(StorageKeys.onboardingCompleted, false);
```

## Design Specifications

### Colors
- Background: Dark grey (AppColors.grey900)
- Text: White with various opacity levels
- Primary accent: Coral/Salmon gradient
- Logo: White + Coral

### Typography
- Page number: 14px, white, semibold
- Title: 32px, white, bold, letter-spacing: 1.5
- Subtitle: 18px, white, semibold
- Content: 16px, white90
- Bullet points: 15px, white95

### Layout
- Padding: 24px horizontal, 32px vertical
- Illustration size: 80px emoji
- Button height: 56px (with padding)
- Page indicator dots: 6-10px diameter
- Spacing: Consistent 12-32px gaps

## Dependencies

No additional dependencies required. Uses existing:
- `flutter_riverpod` - State management
- `go_router` - Navigation
- `shared_preferences` - Persistence

## Future Enhancements

Potential improvements:
- [ ] Animations between slides
- [ ] Video/GIF illustrations instead of emojis
- [ ] Analytics tracking (which slides are skipped)
- [ ] A/B testing different content
- [ ] Localization (English, Kazakh, etc.)
- [ ] Skip onboarding for returning users with a "View Tutorial" option in settings

## Notes

- Custom page indicator implementation (no external package needed)
- All content in Russian as per requirements
- Follows Clean Architecture principles
- Fully compatible with existing codebase structure
- No breaking changes to existing features
