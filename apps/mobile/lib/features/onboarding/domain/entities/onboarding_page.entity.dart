import 'package:flutter/material.dart';

/// Onboarding page entity representing a single slide
class OnboardingPageEntity {
  /// Page number (1-24)
  final int pageNumber;

  /// Main title (e.g., "ИНСТРУКЦИИ")
  final String title;

  /// Subtitle heading
  final String subtitle;

  /// Main content description
  final String content;

  /// Illustration (emoji or icon)
  final String illustration;

  /// Background gradient colors (optional)
  final List<Color>? gradientColors;

  /// Bullet points for key information (optional)
  final List<String>? bulletPoints;

  const OnboardingPageEntity({
    required this.pageNumber,
    required this.title,
    required this.subtitle,
    required this.content,
    required this.illustration,
    this.gradientColors,
    this.bulletPoints,
  });

  /// Check if this is the first page
  bool get isFirst => pageNumber == 1;

  /// Check if this is the last page
  bool get isLast => pageNumber == 24;

  /// Get progress text (e.g., "1 из 24")
  String get progressText => '$pageNumber из 24';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is OnboardingPageEntity &&
          runtimeType == other.runtimeType &&
          pageNumber == other.pageNumber;

  @override
  int get hashCode => pageNumber.hashCode;
}
