import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// App text styles using Manrope font
class AppTextStyles {
  AppTextStyles._();

  // Base text style
  static TextStyle get _baseTextStyle => GoogleFonts.manrope(
        color: AppColors.onBackground,
        height: 1.5,
      );

  // Display Styles (largest)
  static TextStyle get displayLarge => _baseTextStyle.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        height: 1.2,
      );

  static TextStyle get displayMedium => _baseTextStyle.copyWith(
        fontSize: 28,
        fontWeight: FontWeight.bold,
        height: 1.2,
      );

  static TextStyle get displaySmall => _baseTextStyle.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        height: 1.3,
      );

  // Heading Styles
  static TextStyle get headingLarge => _baseTextStyle.copyWith(
        fontSize: 22,
        fontWeight: FontWeight.bold,
        height: 1.3,
      );

  static TextStyle get headingMedium => _baseTextStyle.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.4,
      );

  static TextStyle get headingSmall => _baseTextStyle.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        height: 1.4,
      );

  // Title Styles
  static TextStyle get titleLarge => _baseTextStyle.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
      );

  static TextStyle get titleMedium => _baseTextStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
      );

  static TextStyle get titleSmall => _baseTextStyle.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w600,
      );

  // Body Styles
  static TextStyle get bodyLarge => _baseTextStyle.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.normal,
      );

  static TextStyle get bodyMedium => _baseTextStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.normal,
      );

  static TextStyle get bodySmall => _baseTextStyle.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.normal,
      );

  // Label Styles
  static TextStyle get labelLarge => _baseTextStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w500,
      );

  static TextStyle get labelMedium => _baseTextStyle.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w500,
      );

  static TextStyle get labelSmall => _baseTextStyle.copyWith(
        fontSize: 10,
        fontWeight: FontWeight.w500,
      );

  // Caption
  static TextStyle get caption => _baseTextStyle.copyWith(
        fontSize: 12,
        color: AppColors.grey600,
      );

  // Overline
  static TextStyle get overline => _baseTextStyle.copyWith(
        fontSize: 10,
        fontWeight: FontWeight.w500,
        letterSpacing: 1.5,
        color: AppColors.grey600,
      );

  // Button
  static TextStyle get button => _baseTextStyle.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
      );

  static TextStyle get buttonSmall => _baseTextStyle.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
      );
}
