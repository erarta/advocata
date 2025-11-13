import 'package:equatable/equatable.dart';

/// User entity
class UserEntity extends Equatable {
  final String id;
  final String phoneNumber;
  final String? email;
  final String? firstName;
  final String? lastName;
  final String? avatarUrl;
  final UserRole role;
  final bool isPhoneVerified;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const UserEntity({
    required this.id,
    required this.phoneNumber,
    this.email,
    this.firstName,
    this.lastName,
    this.avatarUrl,
    required this.role,
    required this.isPhoneVerified,
    required this.createdAt,
    this.updatedAt,
  });

  String get fullName {
    if (firstName == null && lastName == null) {
      return phoneNumber;
    }
    return '${firstName ?? ''} ${lastName ?? ''}'.trim();
  }

  String get displayName {
    if (firstName != null) {
      return firstName!;
    }
    if (email != null) {
      return email!.split('@').first;
    }
    return phoneNumber;
  }

  @override
  List<Object?> get props => [
        id,
        phoneNumber,
        email,
        firstName,
        lastName,
        avatarUrl,
        role,
        isPhoneVerified,
        createdAt,
        updatedAt,
      ];
}

/// User role
enum UserRole {
  client,
  lawyer,
  admin;

  String get displayName {
    switch (this) {
      case UserRole.client:
        return 'Клиент';
      case UserRole.lawyer:
        return 'Юрист';
      case UserRole.admin:
        return 'Администратор';
    }
  }
}
