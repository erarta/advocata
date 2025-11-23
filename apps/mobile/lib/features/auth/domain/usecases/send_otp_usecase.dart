import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../repositories/auth_repository.dart';

/// Use case for sending OTP to phone number
class SendOtpUseCase {
  final AuthRepository repository;

  SendOtpUseCase(this.repository);

  /// Execute the use case
  ///
  /// Validates phone number format and sends OTP
  /// Returns Result with void or error
  Future<Result<void>> execute(String phoneNumber) async {
    // Validate phone number
    final validationResult = _validatePhoneNumber(phoneNumber);
    if (validationResult.isFailure) {
      return validationResult;
    }

    // Send OTP via repository
    return await repository.sendOtp(phoneNumber);
  }

  /// Validate phone number format
  Result<void> _validatePhoneNumber(String phoneNumber) {
    // Remove all non-digit characters
    final digits = phoneNumber.replaceAll(RegExp(r'\D'), '');

    // Check if phone number has valid length
    if (digits.isEmpty) {
      return Result.failure(
        const ValidationFailure(message: 'Номер телефона не может быть пустым'),
      );
    }

    // Russian phone number validation
    // Valid formats:
    // - +7XXXXXXXXXX (11 digits with +7)
    // - 7XXXXXXXXXX (11 digits starting with 7)
    // - 8XXXXXXXXXX (11 digits starting with 8)
    // - XXXXXXXXXX (10 digits)
    if (digits.length < 10 || digits.length > 11) {
      return Result.failure(
        const ValidationFailure(
          message: 'Неверный формат номера телефона',
        ),
      );
    }

    if (digits.length == 11 && !digits.startsWith('7') && !digits.startsWith('8')) {
      return Result.failure(
        const ValidationFailure(
          message: 'Номер должен начинаться с 7 или 8',
        ),
      );
    }

    return Result.success(null);
  }
}
