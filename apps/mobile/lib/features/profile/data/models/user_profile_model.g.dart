// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_profile_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserProfileModel _$UserProfileModelFromJson(Map<String, dynamic> json) =>
    UserProfileModel(
      userId: json['user_id'] as String,
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
      email: json['email'] as String?,
      phoneNumber: json['phone_number'] as String,
      avatarUrl: json['avatar_url'] as String?,
      bio: json['bio'] as String?,
      city: json['city'] as String?,
      address: json['address'] as String?,
      dateOfBirth: json['date_of_birth'] == null
          ? null
          : DateTime.parse(json['date_of_birth'] as String),
      notificationsEnabled: json['notifications_enabled'] as bool? ?? true,
      emailNotificationsEnabled:
          json['email_notifications_enabled'] as bool? ?? true,
      smsNotificationsEnabled:
          json['sms_notifications_enabled'] as bool? ?? true,
      pushNotificationsEnabled:
          json['push_notifications_enabled'] as bool? ?? true,
      preferredLanguage: json['preferred_language'] as String? ?? 'ru',
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$UserProfileModelToJson(UserProfileModel instance) =>
    <String, dynamic>{
      'user_id': instance.userId,
      'first_name': instance.firstName,
      'last_name': instance.lastName,
      'email': instance.email,
      'phone_number': instance.phoneNumber,
      'avatar_url': instance.avatarUrl,
      'bio': instance.bio,
      'city': instance.city,
      'address': instance.address,
      'date_of_birth': instance.dateOfBirth?.toIso8601String(),
      'notifications_enabled': instance.notificationsEnabled,
      'email_notifications_enabled': instance.emailNotificationsEnabled,
      'sms_notifications_enabled': instance.smsNotificationsEnabled,
      'push_notifications_enabled': instance.pushNotificationsEnabled,
      'preferred_language': instance.preferredLanguage,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt.toIso8601String(),
    };
