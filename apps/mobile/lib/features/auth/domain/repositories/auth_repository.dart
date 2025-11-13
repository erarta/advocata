import '../../../../core/domain/result/result.dart';
import '../entities/user_entity.dart';

/// Authentication repository interface
abstract class AuthRepository {
  /// Send OTP to phone number
  Future<Result<void>> sendOtp(String phoneNumber);

  /// Verify OTP code
  Future<Result<UserEntity>> verifyOtp(String phoneNumber, String otpCode);

  /// Get current user
  Future<Result<UserEntity>> getCurrentUser();

  /// Sign out
  Future<Result<void>> signOut();

  /// Check if user is authenticated
  Future<bool> isAuthenticated();

  /// Listen to auth state changes
  Stream<UserEntity?> get authStateChanges;
}
