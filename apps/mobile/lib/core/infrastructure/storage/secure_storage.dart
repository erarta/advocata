import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure storage service using FlutterSecureStorage
class SecureStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  /// Write secure data
  static Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  /// Read secure data
  static Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }

  /// Delete secure data
  static Future<void> delete(String key) async {
    await _storage.delete(key: key);
  }

  /// Delete all secure data
  static Future<void> deleteAll() async {
    await _storage.deleteAll();
  }

  /// Check if key exists
  static Future<bool> containsKey(String key) async {
    return await _storage.containsKey(key: key);
  }

  /// Read all secure data
  static Future<Map<String, String>> readAll() async {
    return await _storage.readAll();
  }
}

/// Secure storage keys constants
class SecureStorageKeys {
  SecureStorageKeys._();

  // Authentication
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userId = 'user_id';

  // User data
  static const String userEmail = 'user_email';
  static const String userPhone = 'user_phone';

  // Biometric
  static const String biometricEnabled = 'biometric_enabled';
  static const String pinCode = 'pin_code';
}
