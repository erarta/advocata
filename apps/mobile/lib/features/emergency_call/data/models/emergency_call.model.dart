import 'package:advocata/features/emergency_call/domain/entities/emergency_call.entity.dart';

/// Data model for emergency call
/// Maps between API JSON and domain entity
class EmergencyCallModel {
  final String id;
  final String userId;
  final String? lawyerId;
  final double latitude;
  final double longitude;
  final String address;
  final String status;
  final String? notes;
  final String createdAt;
  final String? acceptedAt;
  final String? completedAt;

  const EmergencyCallModel({
    required this.id,
    required this.userId,
    this.lawyerId,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.status,
    this.notes,
    required this.createdAt,
    this.acceptedAt,
    this.completedAt,
  });

  /// Creates model from JSON response
  factory EmergencyCallModel.fromJson(Map<String, dynamic> json) {
    return EmergencyCallModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      lawyerId: json['lawyer_id'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String,
      status: json['status'] as String,
      notes: json['notes'] as String?,
      createdAt: json['created_at'] as String,
      acceptedAt: json['accepted_at'] as String?,
      completedAt: json['completed_at'] as String?,
    );
  }

  /// Converts model to JSON for API request
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'lawyer_id': lawyerId,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'status': status,
      'notes': notes,
      'created_at': createdAt,
      'accepted_at': acceptedAt,
      'completed_at': completedAt,
    };
  }

  /// Converts model to domain entity
  EmergencyCallEntity toEntity() {
    return EmergencyCallEntity(
      id: id,
      userId: userId,
      lawyerId: lawyerId,
      latitude: latitude,
      longitude: longitude,
      address: address,
      status: EmergencyCallStatusExtension.fromValue(status),
      notes: notes,
      createdAt: DateTime.parse(createdAt),
      acceptedAt: acceptedAt != null ? DateTime.parse(acceptedAt!) : null,
      completedAt: completedAt != null ? DateTime.parse(completedAt!) : null,
    );
  }

  /// Creates model from domain entity
  factory EmergencyCallModel.fromEntity(EmergencyCallEntity entity) {
    return EmergencyCallModel(
      id: entity.id,
      userId: entity.userId,
      lawyerId: entity.lawyerId,
      latitude: entity.latitude,
      longitude: entity.longitude,
      address: entity.address,
      status: entity.status.toValue(),
      notes: entity.notes,
      createdAt: entity.createdAt.toIso8601String(),
      acceptedAt: entity.acceptedAt?.toIso8601String(),
      completedAt: entity.completedAt?.toIso8601String(),
    );
  }
}
