import 'package:flutter/material.dart';

/// App color palette
///
/// Following minimalist design with gradients for Advocata
class AppColors {
  AppColors._();

  // Primary Colors
  static const Color primary = Color(0xFF667EEA);
  static const Color primaryDark = Color(0xFF764BA2);
  static const Color primaryLight = Color(0xFF89A7FF);

  // Secondary Colors
  static const Color secondary = Color(0xFFF093FB);
  static const Color secondaryDark = Color(0xFFF5576C);

  // Coral/Salmon Colors
  static const Color coral = Color(0xFFFF9A8B);
  static const Color salmon = Color(0xFFFFA07A);

  // Neutral Colors
  static const Color black = Color(0xFF000000);
  static const Color white = Color(0xFFFFFFFF);
  static const Color grey900 = Color(0xFF1A1A1A);
  static const Color grey800 = Color(0xFF2D2D2D);
  static const Color grey700 = Color(0xFF404040);
  static const Color grey600 = Color(0xFF757575);
  static const Color grey500 = Color(0xFF9E9E9E);
  static const Color grey400 = Color(0xFFBDBDBD);
  static const Color grey300 = Color(0xFFE0E0E0);
  static const Color grey200 = Color(0xFFEEEEEE);
  static const Color grey100 = Color(0xFFF5F5F5);
  static const Color grey50 = Color(0xFFFAFAFA);

  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color warning = Color(0xFFFF9800);
  static const Color error = Color(0xFFF44336);
  static const Color info = Color(0xFF2196F3);

  // Semantic Colors
  static const Color background = white;
  static const Color surface = white;
  static const Color onPrimary = white;
  static const Color onSecondary = white;
  static const Color onBackground = grey900;
  static const Color onSurface = grey900;

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryDark],
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [secondary, secondaryDark],
  );

  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment(0.0, -1.0),
    end: Alignment(0.0, 1.0),
    colors: [primary, primaryDark],
    stops: [0.0, 1.0],
  );

  static const LinearGradient coralGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [coral, salmon],
  );

  // Shadow Colors
  static Color shadow = grey900.withOpacity(0.1);
  static Color shadowDark = grey900.withOpacity(0.2);
}
