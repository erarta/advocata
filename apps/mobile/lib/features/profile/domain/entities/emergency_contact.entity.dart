import 'package:equatable/equatable.dart';

/// Emergency contact entity
///
/// Represents a trusted contact for emergency notifications
class EmergencyContactEntity extends Equatable {
  final String id;
  final String userId;
  final String name;
  final String phoneNumber;
  final String relationship; // "Супруг(а)", "Родитель", "Друг", etc.
  final DateTime createdAt;
  final DateTime updatedAt;

  const EmergencyContactEntity({
    required this.id,
    required this.userId,
    required this.name,
    required this.phoneNumber,
    required this.relationship,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Get display relationship
  String get displayRelationship {
    final relationshipMap = {
      'spouse': 'Супруг(а)',
      'parent': 'Родитель',
      'child': 'Ребенок',
      'sibling': 'Брат/Сестра',
      'friend': 'Друг',
      'colleague': 'Коллега',
      'other': 'Другое',
    };
    return relationshipMap[relationship] ?? relationship;
  }

  /// Get icon for relationship type
  String get relationshipIcon {
    final iconMap = {
      'spouse': 'favorite',
      'parent': 'family_restroom',
      'child': 'child_care',
      'sibling': 'people',
      'friend': 'person',
      'colleague': 'work',
      'other': 'person_outline',
    };
    return iconMap[relationship] ?? 'person_outline';
  }

  /// Copy with new values
  EmergencyContactEntity copyWith({
    String? id,
    String? userId,
    String? name,
    String? phoneNumber,
    String? relationship,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return EmergencyContactEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      relationship: relationship ?? this.relationship,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        name,
        phoneNumber,
        relationship,
        createdAt,
        updatedAt,
      ];
}
