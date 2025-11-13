import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/presentation/theme/app_colors.dart';
import '../../../../core/presentation/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/widgets.dart';
import '../providers/auth_state_notifier.dart';

/// Login screen with phone number input
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String? _errorText;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Listen to auth state changes
    ref.listen(authStateNotifierProvider, (previous, next) {
      next.when(
        initial: () {},
        loading: () {},
        otpSent: (phoneNumber) {
          // Navigate to OTP verification screen
          context.pushNamed('verify-otp', extra: phoneNumber);
        },
        authenticated: (_) {
          // Navigate to home
          context.go('/home');
        },
        unauthenticated: () {},
        error: (message) {
          // Show error
          setState(() {
            _errorText = message;
          });

          // Show snackbar
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: AppColors.error,
            ),
          );
        },
      );
    });

    final authState = ref.watch(authStateNotifierProvider);
    final isLoading = authState is _Loading;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),

                // Logo
                Center(
                  child: Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.gavel_rounded,
                      size: 50,
                      color: AppColors.white,
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Title
                Text(
                  'Добро пожаловать',
                  style: AppTextStyles.displayMedium,
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 8),

                // Subtitle
                Text(
                  'Введите номер телефона для входа',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.grey600,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 48),

                // Phone input
                PhoneInputField(
                  controller: _phoneController,
                  errorText: _errorText,
                  autofocus: true,
                  textInputAction: TextInputAction.done,
                  onEditingComplete: _handleLogin,
                  onChanged: (_) {
                    // Clear error when user types
                    if (_errorText != null) {
                      setState(() {
                        _errorText = null;
                      });
                    }
                  },
                ),

                const SizedBox(height: 32),

                // Continue button
                PrimaryButton(
                  text: 'Продолжить',
                  onPressed: _handleLogin,
                  isLoading: isLoading,
                ),

                const SizedBox(height: 24),

                // Terms and privacy
                Text(
                  'Продолжая, вы соглашаетесь с условиями использования и политикой конфиденциальности',
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.grey600,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 48),

                // Features list
                _buildFeaturesList(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFeaturesList() {
    final features = [
      _Feature(
        icon: Icons.search_rounded,
        title: 'Быстрый поиск',
        description: 'Найдите юриста за несколько секунд',
      ),
      _Feature(
        icon: Icons.verified_user_rounded,
        title: 'Проверенные юристы',
        description: 'Все специалисты проходят верификацию',
      ),
      _Feature(
        icon: Icons.schedule_rounded,
        title: '24/7 доступность',
        description: 'Получите помощь в любое время',
      ),
    ];

    return Column(
      children: features.map((feature) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  feature.icon,
                  color: AppColors.primary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      feature.title,
                      style: AppTextStyles.titleSmall,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      feature.description,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  void _handleLogin() {
    // Clear previous error
    setState(() {
      _errorText = null;
    });

    // Validate phone number
    final phoneDigits = _phoneController.text.replaceAll(RegExp(r'\D'), '');

    if (phoneDigits.isEmpty) {
      setState(() {
        _errorText = 'Введите номер телефона';
      });
      return;
    }

    if (phoneDigits.length != 10) {
      setState(() {
        _errorText = 'Номер должен содержать 10 цифр';
      });
      return;
    }

    // Send OTP
    final fullPhoneNumber = '+7$phoneDigits';
    ref.read(authStateNotifierProvider.notifier).sendOtp(fullPhoneNumber);
  }
}

class _Feature {
  final IconData icon;
  final String title;
  final String description;

  _Feature({
    required this.icon,
    required this.title,
    required this.description,
  });
}
