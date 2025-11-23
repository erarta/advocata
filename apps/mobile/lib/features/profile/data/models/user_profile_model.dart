import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/user_profile_entity.dart';

part 'user_profile_model.g.dart';

/// User profile data model
@JsonSerializable()
class UserProfileModel {
  @JsonKey(name: 'user_id')
  final String userId;

  @JsonKey(name: 'first_name')
  final String? firstName;

  @JsonKey(name: 'last_name')
  final String? lastName;

  final String? email;

  @JsonKey(name: 'phone_number')
  final String phoneNumber;

  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;

  final String? bio;
  final String? city;
  final String? address;

  @JsonKey(name: 'date_of_birth')
  final DateTime? dateOfBirth;

  @JsonKey(name: 'notifications_enabled')
  final bool notificationsEnabled;

  @JsonKey(name: 'email_notifications_enabled')
  final bool emailNotificationsEnabled;

  @JsonKey(name: 'sms_notifications_enabled')
  final bool smsNotificationsEnabled;

  @JsonKey(name: 'push_notifications_enabled')
  final bool pushNotificationsEnabled;

  @JsonKey(name: 'preferred_language')
  final String preferredLanguage;

  @JsonKey(name: 'created_at')
  final DateTime createdAt;

  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  const UserProfileModel({
    required this.userId,
    this.firstName,
    this.lastName,
    this.email,
    required this.phoneNumber,
    this.avatarUrl,
    this.bio,
    this.city,
    this.address,
    this.dateOfBirth,
    this.notificationsEnabled = true,
    this.emailNotificationsEnabled = true,
    this.smsNotificationsEnabled = true,
    this.pushNotificationsEnabled = true,
    this.preferredLanguage = 'ru',
    required this.createdAt,
    required this.updatedAt,
  });

  /// Create from JSON
  factory UserProfileModel.fromJson(Map<String, dynamic> json) =>
      _$UserProfileModelFromJson(json);

  /// Convert to JSON
  Map<String, dynamic> toJson() => _$UserProfileModelToJson(this);

  /// Convert to entity
  UserProfileEntity toEntity() {
    return UserProfileEntity(
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phoneNumber: phoneNumber,
      avatarUrl: avatarUrl,
      bio: bio,
      city: city,
      address: address,
      dateOfBirth: dateOfBirth,
      notificationsEnabled: notificationsEnabled,
      emailNotificationsEnabled: emailNotificationsEnabled,
      smsNotificationsEnabled: smsNotificationsEnabled,
      pushNotificationsEnabled: pushNotificationsEnabled,
      preferredLanguage: preferredLanguage,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  /// Create from entity
  factory UserProfileModel.fromEntity(UserProfileEntity entity) {
    return UserProfileModel(
      userId: entity.userId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
      avatarUrl: entity.avatarUrl,
      bio: entity.bio,
      city: entity.city,
      address: entity.address,
      dateOfBirth: entity.dateOfBirth,
      notificationsEnabled: entity.notificationsEnabled,
      emailNotificationsEnabled: entity.emailNotificationsEnabled,
      smsNotificationsEnabled: entity.smsNotificationsEnabled,
      pushNotificationsEnabled: entity.pushNotificationsEnabled,
      preferredLanguage: entity.preferredLanguage,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }
}
