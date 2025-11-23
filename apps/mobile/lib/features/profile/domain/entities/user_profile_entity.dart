import 'package:equatable/equatable.dart';

/// User profile entity
///
/// Represents user profile data including personal information,
/// preferences, and settings.
class UserProfileEntity extends Equatable {
  final String userId;
  final String? firstName;
  final String? lastName;
  final String? email;
  final String phoneNumber;
  final String? avatarUrl;
  final String? bio;
  final String? city;
  final String? address;
  final DateTime? dateOfBirth;
  final bool notificationsEnabled;
  final bool emailNotificationsEnabled;
  final bool smsNotificationsEnabled;
  final bool pushNotificationsEnabled;
  final String preferredLanguage;
  final DateTime createdAt;
  final DateTime updatedAt;

  const UserProfileEntity({
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

  /// Get full name
  String get fullName {
    if (firstName == null && lastName == null) {
      return phoneNumber;
    }
    return '${firstName ?? ''} ${lastName ?? ''}'.trim();
  }

  /// Get display name
  String get displayName {
    if (firstName != null) {
      return firstName!;
    }
    if (email != null) {
      return email!.split('@').first;
    }
    return phoneNumber;
  }

  /// Get initials for avatar
  String get initials {
    if (firstName != null && lastName != null) {
      return '${firstName![0]}${lastName![0]}'.toUpperCase();
    }
    if (firstName != null) {
      return firstName![0].toUpperCase();
    }
    return phoneNumber[0];
  }

  /// Check if profile is complete
  bool get isComplete {
    return firstName != null &&
        lastName != null &&
        email != null &&
        city != null;
  }

  /// Calculate profile completion percentage
  int get completionPercentage {
    int completed = 0;
    int total = 7;

    if (firstName != null && firstName!.isNotEmpty) completed++;
    if (lastName != null && lastName!.isNotEmpty) completed++;
    if (email != null && email!.isNotEmpty) completed++;
    if (bio != null && bio!.isNotEmpty) completed++;
    if (city != null && city!.isNotEmpty) completed++;
    if (address != null && address!.isNotEmpty) completed++;
    if (avatarUrl != null && avatarUrl!.isNotEmpty) completed++;

    return ((completed / total) * 100).round();
  }

  /// Copy with new values
  UserProfileEntity copyWith({
    String? userId,
    String? firstName,
    String? lastName,
    String? email,
    String? phoneNumber,
    String? avatarUrl,
    String? bio,
    String? city,
    String? address,
    DateTime? dateOfBirth,
    bool? notificationsEnabled,
    bool? emailNotificationsEnabled,
    bool? smsNotificationsEnabled,
    bool? pushNotificationsEnabled,
    String? preferredLanguage,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserProfileEntity(
      userId: userId ?? this.userId,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      bio: bio ?? this.bio,
      city: city ?? this.city,
      address: address ?? this.address,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      emailNotificationsEnabled:
          emailNotificationsEnabled ?? this.emailNotificationsEnabled,
      smsNotificationsEnabled:
          smsNotificationsEnabled ?? this.smsNotificationsEnabled,
      pushNotificationsEnabled:
          pushNotificationsEnabled ?? this.pushNotificationsEnabled,
      preferredLanguage: preferredLanguage ?? this.preferredLanguage,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        userId,
        firstName,
        lastName,
        email,
        phoneNumber,
        avatarUrl,
        bio,
        city,
        address,
        dateOfBirth,
        notificationsEnabled,
        emailNotificationsEnabled,
        smsNotificationsEnabled,
        pushNotificationsEnabled,
        preferredLanguage,
        createdAt,
        updatedAt,
      ];
}
