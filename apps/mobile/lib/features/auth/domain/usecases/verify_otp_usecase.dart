import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

/// Use case for verifying OTP code
class VerifyOtpUseCase {
  final AuthRepository repository;

  VerifyOtpUseCase(this.repository);

  /// Execute the use case
  ///
  /// Validates OTP code and verifies it
  /// Returns Result with UserEntity or error
  Future<Result<UserEntity>> execute(
    String phoneNumber,
    String otpCode,
  ) async {
    // Validate OTP code
    final validationResult = _validateOtpCode(otpCode);
    if (validationResult.isFailure) {
      return Result.failure(validationResult.failure);
    }

    // Verify OTP via repository
    return await repository.verifyOtp(phoneNumber, otpCode);
  }

  /// Validate OTP code format
  Result<void> _validateOtpCode(String otpCode) {
    // Remove whitespace
    final cleanCode = otpCode.trim();

    if (cleanCode.isEmpty) {
      return Result.failure(
        const ValidationFailure(message: 'Код подтверждения не может быть пустым'),
      );
    }

    // OTP code should be 6 digits
    if (cleanCode.length != 6) {
      return Result.failure(
        const ValidationFailure(
          message: 'Код подтверждения должен содержать 6 цифр',
        ),
      );
    }

    // Check if all characters are digits
    if (!RegExp(r'^\d{6}$').hasMatch(cleanCode)) {
      return Result.failure(
        const ValidationFailure(
          message: 'Код подтверждения должен содержать только цифры',
        ),
      );
    }

    return Result.success(null);
  }
}
