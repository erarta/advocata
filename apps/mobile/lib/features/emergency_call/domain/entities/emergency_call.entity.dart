import 'package:equatable/equatable.dart';

/// Represents an emergency call for immediate legal assistance
/// Domain entity following DDD principles
class EmergencyCallEntity extends Equatable {
  final String id;
  final String userId;
  final String? lawyerId;
  final double latitude;
  final double longitude;
  final String address;
  final EmergencyCallStatus status;
  final String? notes;
  final DateTime createdAt;
  final DateTime? acceptedAt;
  final DateTime? completedAt;

  const EmergencyCallEntity({
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

  /// Creates a new emergency call
  factory EmergencyCallEntity.create({
    required String id,
    required String userId,
    required double latitude,
    required double longitude,
    required String address,
    String? notes,
  }) {
    return EmergencyCallEntity(
      id: id,
      userId: userId,
      latitude: latitude,
      longitude: longitude,
      address: address,
      status: EmergencyCallStatus.pending,
      notes: notes,
      createdAt: DateTime.now(),
    );
  }

  /// Accepts the emergency call by a lawyer
  EmergencyCallEntity accept(String lawyerId) {
    return copyWith(
      lawyerId: lawyerId,
      status: EmergencyCallStatus.accepted,
      acceptedAt: DateTime.now(),
    );
  }

  /// Completes the emergency call
  EmergencyCallEntity complete() {
    return copyWith(
      status: EmergencyCallStatus.completed,
      completedAt: DateTime.now(),
    );
  }

  /// Cancels the emergency call
  EmergencyCallEntity cancel() {
    return copyWith(status: EmergencyCallStatus.cancelled);
  }

  /// Creates a copy with updated fields
  EmergencyCallEntity copyWith({
    String? id,
    String? userId,
    String? lawyerId,
    double? latitude,
    double? longitude,
    String? address,
    EmergencyCallStatus? status,
    String? notes,
    DateTime? createdAt,
    DateTime? acceptedAt,
    DateTime? completedAt,
  }) {
    return EmergencyCallEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      lawyerId: lawyerId ?? this.lawyerId,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        lawyerId,
        latitude,
        longitude,
        address,
        status,
        notes,
        createdAt,
        acceptedAt,
        completedAt,
      ];
}

/// Status of an emergency call
enum EmergencyCallStatus {
  /// Call is pending, waiting for lawyer acceptance
  pending,

  /// Call has been accepted by a lawyer
  accepted,

  /// Call has been completed
  completed,

  /// Call has been cancelled
  cancelled,
}

/// Extension to convert status enum to/from string
extension EmergencyCallStatusExtension on EmergencyCallStatus {
  String toValue() {
    switch (this) {
      case EmergencyCallStatus.pending:
        return 'pending';
      case EmergencyCallStatus.accepted:
        return 'accepted';
      case EmergencyCallStatus.completed:
        return 'completed';
      case EmergencyCallStatus.cancelled:
        return 'cancelled';
    }
  }

  static EmergencyCallStatus fromValue(String value) {
    switch (value) {
      case 'pending':
        return EmergencyCallStatus.pending;
      case 'accepted':
        return EmergencyCallStatus.accepted;
      case 'completed':
        return EmergencyCallStatus.completed;
      case 'cancelled':
        return EmergencyCallStatus.cancelled;
      default:
        throw ArgumentError('Invalid emergency call status: $value');
    }
  }
}
