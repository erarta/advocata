import 'package:shared_preferences/shared_preferences.dart';

/// Local storage service using SharedPreferences
class LocalStorage {
  static SharedPreferences? _prefs;

  /// Initialize local storage
  static Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static SharedPreferences get _instance {
    if (_prefs == null) {
      throw Exception(
        'LocalStorage has not been initialized. Call LocalStorage.initialize() first.',
      );
    }
    return _prefs!;
  }

  // String operations
  static Future<bool> setString(String key, String value) async {
    return await _instance.setString(key, value);
  }

  static String? getString(String key) {
    return _instance.getString(key);
  }

  // Bool operations
  static Future<bool> setBool(String key, bool value) async {
    return await _instance.setBool(key, value);
  }

  static bool? getBool(String key) {
    return _instance.getBool(key);
  }

  // Int operations
  static Future<bool> setInt(String key, int value) async {
    return await _instance.setInt(key, value);
  }

  static int? getInt(String key) {
    return _instance.getInt(key);
  }

  // Double operations
  static Future<bool> setDouble(String key, double value) async {
    return await _instance.setDouble(key, value);
  }

  static double? getDouble(String key) {
    return _instance.getDouble(key);
  }

  // List operations
  static Future<bool> setStringList(String key, List<String> value) async {
    return await _instance.setStringList(key, value);
  }

  static List<String>? getStringList(String key) {
    return _instance.getStringList(key);
  }

  // Remove
  static Future<bool> remove(String key) async {
    return await _instance.remove(key);
  }

  // Clear all
  static Future<bool> clear() async {
    return await _instance.clear();
  }

  // Check if key exists
  static bool containsKey(String key) {
    return _instance.containsKey(key);
  }

  // Get all keys
  static Set<String> getKeys() {
    return _instance.getKeys();
  }
}

/// Storage keys constants
class StorageKeys {
  StorageKeys._();

  // User preferences
  static const String onboardingCompleted = 'onboarding_completed';
  static const String language = 'language';
  static const String theme = 'theme';

  // Cache
  static const String lastSyncTime = 'last_sync_time';
  static const String cachedUserData = 'cached_user_data';

  // Filters and search
  static const String recentSearches = 'recent_searches';
  static const String savedFilters = 'saved_filters';
}
