import 'package:equatable/equatable.dart';

/// Saved address entity
///
/// Represents a user's saved location for quick emergency lawyer calls
class SavedAddressEntity extends Equatable {
  final String id;
  final String userId;
  final String label; // "Дом", "Работа", or custom
  final String address;
  final double latitude;
  final double longitude;
  final bool isDefault;
  final DateTime createdAt;
  final DateTime updatedAt;

  const SavedAddressEntity({
    required this.id,
    required this.userId,
    required this.label,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.isDefault = false,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Get display label
  String get displayLabel {
    if (label == 'home') return 'Дом';
    if (label == 'work') return 'Работа';
    return label;
  }

  /// Get icon for address type
  String get iconType {
    if (label == 'home') return 'home';
    if (label == 'work') return 'work';
    return 'location';
  }

  /// Copy with new values
  SavedAddressEntity copyWith({
    String? id,
    String? userId,
    String? label,
    String? address,
    double? latitude,
    double? longitude,
    bool? isDefault,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return SavedAddressEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      label: label ?? this.label,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      isDefault: isDefault ?? this.isDefault,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        label,
        address,
        latitude,
        longitude,
        isDefault,
        createdAt,
        updatedAt,
      ];
}
