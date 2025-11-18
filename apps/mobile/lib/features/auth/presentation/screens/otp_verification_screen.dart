import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pinput/pinput.dart';
import '../../../../core/presentation/theme/app_colors.dart';
import '../../../../core/presentation/theme/app_text_styles.dart';
import '../../../../core/presentation/widgets/widgets.dart';
import '../providers/auth_state_notifier.dart';

/// OTP verification screen
class OtpVerificationScreen extends ConsumerStatefulWidget {
  final String phoneNumber;

  const OtpVerificationScreen({
    super.key,
    required this.phoneNumber,
  });

  @override
  ConsumerState<OtpVerificationScreen> createState() =>
      _OtpVerificationScreenState();
}

class _OtpVerificationScreenState
    extends ConsumerState<OtpVerificationScreen> {
  final _pinController = TextEditingController();
  final _focusNode = FocusNode();

  Timer? _timer;
  int _remainingSeconds = 60;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _pinController.dispose();
    _focusNode.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _remainingSeconds = 60;
    _canResend = false;

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        setState(() {
          _canResend = true;
        });
        timer.cancel();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Listen to auth state changes
    ref.listen(authStateNotifierProvider, (previous, next) {
      next.when(
        initial: () {},
        loading: () {},
        otpSent: (_) {
          // OTP resent successfully
          _startTimer();

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Код отправлен повторно'),
              backgroundColor: AppColors.success,
            ),
          );
        },
        authenticated: (_) {
          // Navigate to home
          context.go('/home');
        },
        unauthenticated: () {},
        error: (message) {
          // Show error
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: AppColors.error,
            ),
          );

          // Clear PIN
          _pinController.clear();
        },
      );
    });

    final authState = ref.watch(authStateNotifierProvider);
    final isLoading = authState is _Loading;

    // Format phone number for display
    final formattedPhone = _formatPhoneNumber(widget.phoneNumber);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
      ),
      body: LoadingOverlay(
        isLoading: isLoading,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 24),

                // Icon
                Center(
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.phone_android_rounded,
                      size: 40,
                      color: AppColors.primary,
                    ),
                  ),
                ),

                const SizedBox(height: 32),

                // Title
                Text(
                  'Введите код',
                  style: AppTextStyles.displayMedium,
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 8),

                // Subtitle
                RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.grey600,
                    ),
                    children: [
                      const TextSpan(text: 'Мы отправили код на номер\n'),
                      TextSpan(
                        text: formattedPhone,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: AppColors.onBackground,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 48),

                // PIN input
                Pinput(
                  controller: _pinController,
                  focusNode: _focusNode,
                  length: 6,
                  autofocus: true,
                  defaultPinTheme: _buildPinTheme(),
                  focusedPinTheme: _buildPinTheme(focused: true),
                  errorPinTheme: _buildPinTheme(error: true),
                  onCompleted: _handleVerify,
                  enabled: !isLoading,
                ),

                const SizedBox(height: 32),

                // Resend button
                Center(
                  child: _canResend
                      ? TextButton(
                          onPressed: _handleResend,
                          child: const Text('Отправить код повторно'),
                        )
                      : Text(
                          'Отправить повторно через $_remainingSeconds сек',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.grey500,
                          ),
                        ),
                ),

                const Spacer(),

                // Verify button
                PrimaryButton(
                  text: 'Подтвердить',
                  onPressed: _pinController.text.length == 6
                      ? () => _handleVerify(_pinController.text)
                      : null,
                  isLoading: isLoading,
                ),

                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  PinTheme _buildPinTheme({bool focused = false, bool error = false}) {
    return PinTheme(
      width: 48,
      height: 56,
      textStyle: AppTextStyles.headingLarge,
      decoration: BoxDecoration(
        color: AppColors.grey50,
        border: Border.all(
          color: error
              ? AppColors.error
              : focused
                  ? AppColors.primary
                  : AppColors.grey300,
          width: focused ? 2 : 1,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }

  String _formatPhoneNumber(String phoneNumber) {
    // +7XXXXXXXXXX -> +7 (XXX) XXX-XX-XX
    if (phoneNumber.startsWith('+7') && phoneNumber.length == 12) {
      return '+7 (${phoneNumber.substring(2, 5)}) ${phoneNumber.substring(5, 8)}-${phoneNumber.substring(8, 10)}-${phoneNumber.substring(10)}';
    }
    return phoneNumber;
  }

  void _handleVerify(String code) {
    ref
        .read(authStateNotifierProvider.notifier)
        .verifyOtp(widget.phoneNumber, code);
  }

  void _handleResend() {
    ref.read(authStateNotifierProvider.notifier).sendOtp(widget.phoneNumber);
  }
}
