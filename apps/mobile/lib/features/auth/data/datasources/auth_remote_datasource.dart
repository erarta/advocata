import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../models/user_model.dart';

/// Auth remote data source
abstract class AuthRemoteDataSource {
  Future<void> sendOtp(String phoneNumber);
  Future<UserModel> verifyOtp(String phoneNumber, String otpCode);
  Future<UserModel> getCurrentUser();
  Future<void> signOut();
  Stream<UserModel?> get authStateChanges;
}

/// Auth remote data source implementation
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final SupabaseClient supabaseClient;

  AuthRemoteDataSourceImpl({required this.supabaseClient});

  @override
  Future<void> sendOtp(String phoneNumber) async {
    try {
      // Normalize phone number to E.164 format (+7XXXXXXXXXX)
      final normalizedPhone = _normalizePhoneNumber(phoneNumber);

      await supabaseClient.auth.signInWithOtp(
        phone: normalizedPhone,
        channel: OtpChannel.sms,
      );
    } on AuthException catch (e) {
      throw AuthenticationException(
        message: _mapAuthErrorMessage(e.message),
        code: e.statusCode != null ? int.tryParse(e.statusCode!) : null,
      );
    } catch (e) {
      throw ServerException(message: 'Не удалось отправить код: $e');
    }
  }

  @override
  Future<UserModel> verifyOtp(String phoneNumber, String otpCode) async {
    try {
      // Normalize phone number to E.164 format
      final normalizedPhone = _normalizePhoneNumber(phoneNumber);

      final response = await supabaseClient.auth.verifyOTP(
        phone: normalizedPhone,
        token: otpCode,
        type: OtpType.sms,
      );

      if (response.user == null) {
        throw const AuthenticationException(
          message: 'Не удалось войти в систему',
        );
      }

      // Get or create user profile
      return await _getOrCreateUserProfile(response.user!);
    } on AuthException catch (e) {
      throw AuthenticationException(
        message: _mapAuthErrorMessage(e.message),
        code: e.statusCode != null ? int.tryParse(e.statusCode!) : null,
      );
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось подтвердить код: $e');
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Get user profile from database
      final response = await supabaseClient
          .from('users')
          .select()
          .eq('id', user.id)
          .single();

      return UserModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось получить данные пользователя: $e');
    }
  }

  @override
  Future<void> signOut() async {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      throw ServerException(message: 'Не удалось выйти из системы: $e');
    }
  }

  @override
  Stream<UserModel?> get authStateChanges {
    return supabaseClient.auth.onAuthStateChange.asyncMap((data) async {
      if (data.session?.user == null) {
        return null;
      }

      try {
        return await getCurrentUser();
      } catch (e) {
        return null;
      }
    });
  }

  /// Get or create user profile in database
  Future<UserModel> _getOrCreateUserProfile(User authUser) async {
    try {
      // Try to get existing profile
      final response = await supabaseClient
          .from('users')
          .select()
          .eq('id', authUser.id)
          .maybeSingle();

      if (response != null) {
        return UserModel.fromJson(response);
      }

      // Create new profile
      final newUser = {
        'id': authUser.id,
        'phone_number': authUser.phone ?? '',
        'email': authUser.email,
        'role': 'client',
        'is_phone_verified': true,
        'created_at': DateTime.now().toIso8601String(),
      };

      final created = await supabaseClient
          .from('users')
          .insert(newUser)
          .select()
          .single();

      return UserModel.fromJson(created);
    } catch (e) {
      throw ServerException(message: 'Не удалось создать профиль: $e');
    }
  }

  /// Normalize phone number to E.164 format (+7XXXXXXXXXX)
  String _normalizePhoneNumber(String phoneNumber) {
    // Remove all non-digit characters
    final digits = phoneNumber.replaceAll(RegExp(r'\D'), '');

    // Handle different formats
    if (digits.startsWith('8') && digits.length == 11) {
      // 8XXXXXXXXXX -> +7XXXXXXXXXX
      return '+7${digits.substring(1)}';
    } else if (digits.startsWith('7') && digits.length == 11) {
      // 7XXXXXXXXXX -> +7XXXXXXXXXX
      return '+$digits';
    } else if (digits.length == 10) {
      // XXXXXXXXXX -> +7XXXXXXXXXX
      return '+7$digits';
    } else if (phoneNumber.startsWith('+7')) {
      // Already in correct format
      return phoneNumber;
    }

    throw const ValidationException(
      message: 'Неверный формат номера телефона',
    );
  }

  /// Map auth error messages to user-friendly Russian messages
  String _mapAuthErrorMessage(String message) {
    final lowerMessage = message.toLowerCase();

    if (lowerMessage.contains('invalid') || lowerMessage.contains('wrong')) {
      return 'Неверный код подтверждения';
    } else if (lowerMessage.contains('expired')) {
      return 'Код подтверждения истек';
    } else if (lowerMessage.contains('too many requests')) {
      return 'Слишком много попыток. Попробуйте позже';
    } else if (lowerMessage.contains('rate limit')) {
      return 'Превышен лимит запросов. Подождите минуту';
    }

    return 'Ошибка авторизации: $message';
  }
}
