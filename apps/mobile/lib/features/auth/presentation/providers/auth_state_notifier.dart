import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/auth_repository.dart';
import 'auth_providers.dart';
import 'auth_state.dart';

/// Auth state notifier
class AuthStateNotifier extends StateNotifier<AuthState> {
  final AuthRepository _authRepository;

  AuthStateNotifier(this._authRepository) : super(const AuthState.initial());

  /// Send OTP to phone number
  Future<void> sendOtp(String phoneNumber) async {
    state = const AuthState.loading();

    final result = await _authRepository.sendOtp(phoneNumber);

    state = result.fold(
      onSuccess: (_) => AuthState.otpSent(phoneNumber),
      onFailure: (failure) => AuthState.error(failure.message),
    );
  }

  /// Verify OTP code
  Future<void> verifyOtp(String phoneNumber, String otpCode) async {
    state = const AuthState.loading();

    final result = await _authRepository.verifyOtp(phoneNumber, otpCode);

    state = result.fold(
      onSuccess: (user) => AuthState.authenticated(user),
      onFailure: (failure) => AuthState.error(failure.message),
    );
  }

  /// Sign out
  Future<void> signOut() async {
    state = const AuthState.loading();

    final result = await _authRepository.signOut();

    state = result.fold(
      onSuccess: (_) => const AuthState.unauthenticated(),
      onFailure: (failure) => AuthState.error(failure.message),
    );
  }

  /// Reset state
  void reset() {
    state = const AuthState.initial();
  }
}

/// Auth state notifier provider
final authStateNotifierProvider =
    StateNotifierProvider<AuthStateNotifier, AuthState>((ref) {
  return AuthStateNotifier(ref.watch(authRepositoryProvider));
});
