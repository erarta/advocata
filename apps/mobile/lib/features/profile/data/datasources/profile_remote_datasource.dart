import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../models/user_profile_model.dart';

/// Profile remote data source interface
abstract class ProfileRemoteDataSource {
  Future<UserProfileModel> getProfile();
  Future<UserProfileModel> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? bio,
    String? city,
    String? address,
    DateTime? dateOfBirth,
  });
  Future<String> updateAvatar(File imageFile);
  Future<void> deleteAvatar();
  Future<UserProfileModel> updateNotificationSettings({
    bool? notificationsEnabled,
    bool? emailNotificationsEnabled,
    bool? smsNotificationsEnabled,
    bool? pushNotificationsEnabled,
  });
  Future<UserProfileModel> updateLanguagePreference(String language);
  Future<void> deleteAccount();
}

/// Profile remote data source implementation
class ProfileRemoteDataSourceImpl implements ProfileRemoteDataSource {
  final SupabaseClient supabaseClient;

  ProfileRemoteDataSourceImpl({required this.supabaseClient});

  @override
  Future<UserProfileModel> getProfile() async {
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

      return UserProfileModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось получить профиль: $e');
    }
  }

  @override
  Future<UserProfileModel> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? bio,
    String? city,
    String? address,
    DateTime? dateOfBirth,
  }) async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Build update map
      final Map<String, dynamic> updates = {
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (firstName != null) updates['first_name'] = firstName;
      if (lastName != null) updates['last_name'] = lastName;
      if (email != null) updates['email'] = email;
      if (bio != null) updates['bio'] = bio;
      if (city != null) updates['city'] = city;
      if (address != null) updates['address'] = address;
      if (dateOfBirth != null) {
        updates['date_of_birth'] = dateOfBirth.toIso8601String();
      }

      // Update profile in database
      final response = await supabaseClient
          .from('users')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

      return UserProfileModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось обновить профиль: $e');
    }
  }

  @override
  Future<String> updateAvatar(File imageFile) async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Generate unique file name
      final fileName = '${user.id}_${DateTime.now().millisecondsSinceEpoch}';
      final fileExtension = imageFile.path.split('.').last;
      final filePath = 'avatars/$fileName.$fileExtension';

      // Upload to Supabase Storage
      await supabaseClient.storage
          .from('user-uploads')
          .upload(filePath, imageFile);

      // Get public URL
      final avatarUrl = supabaseClient.storage
          .from('user-uploads')
          .getPublicUrl(filePath);

      // Update user profile with avatar URL
      await supabaseClient
          .from('users')
          .update({
            'avatar_url': avatarUrl,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', user.id);

      return avatarUrl;
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось загрузить аватар: $e');
    }
  }

  @override
  Future<void> deleteAvatar() async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Get current avatar URL to delete from storage
      final response = await supabaseClient
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

      final avatarUrl = response['avatar_url'] as String?;

      // Delete from storage if exists
      if (avatarUrl != null && avatarUrl.isNotEmpty) {
        // Extract file path from URL
        final uri = Uri.parse(avatarUrl);
        final pathSegments = uri.pathSegments;
        if (pathSegments.length >= 2) {
          final filePath = pathSegments.sublist(pathSegments.length - 2).join('/');
          await supabaseClient.storage
              .from('user-uploads')
              .remove([filePath]);
        }
      }

      // Remove avatar URL from profile
      await supabaseClient
          .from('users')
          .update({
            'avatar_url': null,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', user.id);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось удалить аватар: $e');
    }
  }

  @override
  Future<UserProfileModel> updateNotificationSettings({
    bool? notificationsEnabled,
    bool? emailNotificationsEnabled,
    bool? smsNotificationsEnabled,
    bool? pushNotificationsEnabled,
  }) async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Build update map
      final Map<String, dynamic> updates = {
        'updated_at': DateTime.now().toIso8601String(),
      };

      if (notificationsEnabled != null) {
        updates['notifications_enabled'] = notificationsEnabled;
      }
      if (emailNotificationsEnabled != null) {
        updates['email_notifications_enabled'] = emailNotificationsEnabled;
      }
      if (smsNotificationsEnabled != null) {
        updates['sms_notifications_enabled'] = smsNotificationsEnabled;
      }
      if (pushNotificationsEnabled != null) {
        updates['push_notifications_enabled'] = pushNotificationsEnabled;
      }

      // Update profile in database
      final response = await supabaseClient
          .from('users')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

      return UserProfileModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(
        message: 'Не удалось обновить настройки уведомлений: $e',
      );
    }
  }

  @override
  Future<UserProfileModel> updateLanguagePreference(String language) async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Update language preference
      final response = await supabaseClient
          .from('users')
          .update({
            'preferred_language': language,
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', user.id)
          .select()
          .single();

      return UserProfileModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(
        message: 'Не удалось обновить язык: $e',
      );
    }
  }

  @override
  Future<void> deleteAccount() async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Delete user from database (cascade will handle related data)
      await supabaseClient.from('users').delete().eq('id', user.id);

      // Delete auth user
      // Note: This requires admin privileges in Supabase
      // In production, this should be handled by a backend endpoint
      await supabaseClient.auth.signOut();
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось удалить аккаунт: $e');
    }
  }
}
