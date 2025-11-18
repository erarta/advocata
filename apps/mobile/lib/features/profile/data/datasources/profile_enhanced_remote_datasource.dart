import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../models/saved_address_model.dart';
import '../models/emergency_contact_model.dart';
import '../models/referral_info_model.dart';
import '../models/app_settings_model.dart';

/// Profile enhanced remote data source interface
/// Handles saved addresses, emergency contacts, referral, and settings
abstract class ProfileEnhancedRemoteDataSource {
  // Saved Addresses
  Future<List<SavedAddressModel>> getAddresses();
  Future<SavedAddressModel> getAddress(String addressId);
  Future<SavedAddressModel> addAddress({
    required String label,
    required String address,
    required double latitude,
    required double longitude,
    bool isDefault = false,
  });
  Future<SavedAddressModel> updateAddress({
    required String addressId,
    String? label,
    String? address,
    double? latitude,
    double? longitude,
    bool? isDefault,
  });
  Future<void> deleteAddress(String addressId);

  // Emergency Contacts
  Future<List<EmergencyContactModel>> getEmergencyContacts();
  Future<EmergencyContactModel> getEmergencyContact(String contactId);
  Future<EmergencyContactModel> addEmergencyContact({
    required String name,
    required String phoneNumber,
    required String relationship,
  });
  Future<EmergencyContactModel> updateEmergencyContact({
    required String contactId,
    String? name,
    String? phoneNumber,
    String? relationship,
  });
  Future<void> deleteEmergencyContact(String contactId);

  // Referral
  Future<ReferralInfoModel> getReferralInfo();
  Future<ReferralInfoModel> redeemReferralCode(String code);

  // Settings
  Future<AppSettingsModel> getSettings();
  Future<AppSettingsModel> updateSettings({
    String? themeMode,
    String? language,
    Map<String, dynamic>? notifications,
    bool? biometricEnabled,
    bool? analyticsEnabled,
    bool? crashReportingEnabled,
  });
}

/// Profile enhanced remote data source implementation
class ProfileEnhancedRemoteDataSourceImpl
    implements ProfileEnhancedRemoteDataSource {
  final SupabaseClient supabaseClient;

  ProfileEnhancedRemoteDataSourceImpl({required this.supabaseClient});

  String get _userId {
    final user = supabaseClient.auth.currentUser;
    if (user == null) {
      throw const AuthenticationException(message: 'Пользователь не авторизован');
    }
    return user.id;
  }

  // ============= Saved Addresses =============

  @override
  Future<List<SavedAddressModel>> getAddresses() async {
    try {
      final response = await supabaseClient
          .from('user_addresses')
          .select()
          .eq('user_id', _userId)
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => SavedAddressModel.fromJson(json))
          .toList();
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось получить адреса: $e');
    }
  }

  @override
  Future<SavedAddressModel> getAddress(String addressId) async {
    try {
      final response = await supabaseClient
          .from('user_addresses')
          .select()
          .eq('id', addressId)
          .eq('user_id', _userId)
          .single();

      return SavedAddressModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось получить адрес: $e');
    }
  }

  @override
  Future<SavedAddressModel> addAddress({
    required String label,
    required String address,
    required double latitude,
    required double longitude,
    bool isDefault = false,
  }) async {
    try {
      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabaseClient
            .from('user_addresses')
            .update({'is_default': false})
            .eq('user_id', _userId)
            .eq('is_default', true);
      }

      final response = await supabaseClient
          .from('user_addresses')
          .insert({
            'user_id': _userId,
            'label': label,
            'address': address,
            'latitude': latitude,
            'longitude': longitude,
            'is_default': isDefault,
            'created_at': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          })
          .select()
          .single();

      return SavedAddressModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось добавить адрес: $e');
    }
  }

  @override
  Future<SavedAddressModel> updateAddress({
    required String addressId,
    String? label,
    String? address,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) async {
    try {
      final Map<String, dynamic> updates = {
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (label != null) updates['label'] = label;
      if (address != null) updates['address'] = address;
      if (latitude != null) updates['latitude'] = latitude;
      if (longitude != null) updates['longitude'] = longitude;
      if (isDefault != null) {
        updates['is_default'] = isDefault;
        // If setting as default, unset other defaults first
        if (isDefault) {
          await supabaseClient
              .from('user_addresses')
              .update({'is_default': false})
              .eq('user_id', _userId)
              .eq('is_default', true)
              .neq('id', addressId);
        }
      }

      final response = await supabaseClient
          .from('user_addresses')
          .update(updates)
          .eq('id', addressId)
          .eq('user_id', _userId)
          .select()
          .single();

      return SavedAddressModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось обновить адрес: $e');
    }
  }

  @override
  Future<void> deleteAddress(String addressId) async {
    try {
      await supabaseClient
          .from('user_addresses')
          .delete()
          .eq('id', addressId)
          .eq('user_id', _userId);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось удалить адрес: $e');
    }
  }

  // ============= Emergency Contacts =============

  @override
  Future<List<EmergencyContactModel>> getEmergencyContacts() async {
    try {
      final response = await supabaseClient
          .from('emergency_contacts')
          .select()
          .eq('user_id', _userId)
          .order('created_at', ascending: false);

      return (response as List)
          .map((json) => EmergencyContactModel.fromJson(json))
          .toList();
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось получить контакты: $e');
    }
  }

  @override
  Future<EmergencyContactModel> getEmergencyContact(String contactId) async {
    try {
      final response = await supabaseClient
          .from('emergency_contacts')
          .select()
          .eq('id', contactId)
          .eq('user_id', _userId)
          .single();

      return EmergencyContactModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось получить контакт: $e');
    }
  }

  @override
  Future<EmergencyContactModel> addEmergencyContact({
    required String name,
    required String phoneNumber,
    required String relationship,
  }) async {
    try {
      final response = await supabaseClient
          .from('emergency_contacts')
          .insert({
            'user_id': _userId,
            'name': name,
            'phone_number': phoneNumber,
            'relationship': relationship,
            'created_at': DateTime.now().toIso8601String(),
            'updated_at': DateTime.now().toIso8601String(),
          })
          .select()
          .single();

      return EmergencyContactModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось добавить контакт: $e');
    }
  }

  @override
  Future<EmergencyContactModel> updateEmergencyContact({
    required String contactId,
    String? name,
    String? phoneNumber,
    String? relationship,
  }) async {
    try {
      final Map<String, dynamic> updates = {
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (name != null) updates['name'] = name;
      if (phoneNumber != null) updates['phone_number'] = phoneNumber;
      if (relationship != null) updates['relationship'] = relationship;

      final response = await supabaseClient
          .from('emergency_contacts')
          .update(updates)
          .eq('id', contactId)
          .eq('user_id', _userId)
          .select()
          .single();

      return EmergencyContactModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось обновить контакт: $e');
    }
  }

  @override
  Future<void> deleteEmergencyContact(String contactId) async {
    try {
      await supabaseClient
          .from('emergency_contacts')
          .delete()
          .eq('id', contactId)
          .eq('user_id', _userId);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось удалить контакт: $e');
    }
  }

  // ============= Referral =============

  @override
  Future<ReferralInfoModel> getReferralInfo() async {
    try {
      // Get or create referral info
      final response = await supabaseClient
          .from('referral_codes')
          .select('''
            *,
            redemptions:referral_redemptions(
              id,
              referee_id,
              referee:users!referee_id(first_name, last_name),
              bonus_amount,
              created_at
            )
          ''')
          .eq('user_id', _userId)
          .maybeSingle();

      if (response == null) {
        // Create new referral code
        final code = _generateReferralCode();
        final newResponse = await supabaseClient
            .from('referral_codes')
            .insert({
              'user_id': _userId,
              'code': code,
              'created_at': DateTime.now().toIso8601String(),
            })
            .select()
            .single();

        return ReferralInfoModel.fromJson({
          ...newResponse,
          'total_invites': 0,
          'successful_invites': 0,
          'total_bonus_earned': 0.0,
          'current_balance': 0.0,
          'redemptions': [],
        });
      }

      // Calculate statistics
      final redemptions = response['redemptions'] as List? ?? [];
      final totalInvites = redemptions.length;
      final successfulInvites = redemptions.length;
      final totalBonusEarned = redemptions.fold<double>(
        0.0,
        (sum, r) => sum + (r['bonus_amount'] as num).toDouble(),
      );

      return ReferralInfoModel.fromJson({
        ...response,
        'total_invites': totalInvites,
        'successful_invites': successfulInvites,
        'total_bonus_earned': totalBonusEarned,
        'current_balance': totalBonusEarned,
        'redemptions': redemptions.map((r) => {
          'id': r['id'],
          'referee_id': r['referee_id'],
          'referee_name': '${r['referee']['first_name']} ${r['referee']['last_name']}',
          'bonus_amount': r['bonus_amount'],
          'redeemed_at': r['created_at'],
        }).toList(),
      });
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось получить реферальную информацию: $e');
    }
  }

  @override
  Future<ReferralInfoModel> redeemReferralCode(String code) async {
    try {
      // Find referral code
      final referralCode = await supabaseClient
          .from('referral_codes')
          .select('user_id')
          .eq('code', code)
          .maybeSingle();

      if (referralCode == null) {
        throw const ValidationException(message: 'Промокод не найден');
      }

      final referrerId = referralCode['user_id'];
      if (referrerId == _userId) {
        throw const ValidationException(message: 'Нельзя использовать свой промокод');
      }

      // Check if already redeemed
      final existing = await supabaseClient
          .from('referral_redemptions')
          .select()
          .eq('referee_id', _userId)
          .maybeSingle();

      if (existing != null) {
        throw const ValidationException(message: 'Вы уже использовали промокод');
      }

      // Create redemption
      await supabaseClient.from('referral_redemptions').insert({
        'referrer_id': referrerId,
        'referee_id': _userId,
        'code': code,
        'bonus_amount': 500.0,
        'created_at': DateTime.now().toIso8601String(),
      });

      // Return updated referral info
      return getReferralInfo();
    } catch (e) {
      if (e is AuthenticationException || e is ValidationException) rethrow;
      throw ServerException(message: 'Не удалось активировать промокод: $e');
    }
  }

  String _generateReferralCode() {
    // Generate 8-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final random = DateTime.now().millisecondsSinceEpoch;
    final code = List.generate(8, (i) => chars[(random + i) % chars.length]);
    return code.join();
  }

  // ============= Settings =============

  @override
  Future<AppSettingsModel> getSettings() async {
    try {
      final response = await supabaseClient
          .from('user_settings')
          .select()
          .eq('user_id', _userId)
          .maybeSingle();

      if (response == null) {
        // Create default settings
        final defaultSettings = {
          'user_id': _userId,
          'theme_mode': 'system',
          'language': 'ru',
          'notifications': {
            'pushEnabled': true,
            'smsEnabled': true,
            'emailEnabled': true,
            'consultationReminders': true,
            'paymentNotifications': true,
            'marketingNotifications': false,
          },
          'biometric_enabled': false,
          'analytics_enabled': true,
          'crash_reporting_enabled': true,
          'updated_at': DateTime.now().toIso8601String(),
        };

        final newResponse = await supabaseClient
            .from('user_settings')
            .insert(defaultSettings)
            .select()
            .single();

        return AppSettingsModel.fromJson(newResponse);
      }

      return AppSettingsModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось получить настройки: $e');
    }
  }

  @override
  Future<AppSettingsModel> updateSettings({
    String? themeMode,
    String? language,
    Map<String, dynamic>? notifications,
    bool? biometricEnabled,
    bool? analyticsEnabled,
    bool? crashReportingEnabled,
  }) async {
    try {
      final Map<String, dynamic> updates = {
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (themeMode != null) updates['theme_mode'] = themeMode;
      if (language != null) updates['language'] = language;
      if (notifications != null) updates['notifications'] = notifications;
      if (biometricEnabled != null) updates['biometric_enabled'] = biometricEnabled;
      if (analyticsEnabled != null) updates['analytics_enabled'] = analyticsEnabled;
      if (crashReportingEnabled != null) {
        updates['crash_reporting_enabled'] = crashReportingEnabled;
      }

      final response = await supabaseClient
          .from('user_settings')
          .update(updates)
          .eq('user_id', _userId)
          .select()
          .single();

      return AppSettingsModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось обновить настройки: $e');
    }
  }
}
