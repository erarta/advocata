import 'package:json_annotation/json_annotation.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';

part 'consultation_model.g.dart';

@JsonSerializable()
class ConsultationModel {
  final String id;
  @JsonKey(name: 'client_id')
  final String clientId;
  @JsonKey(name: 'lawyer_id')
  final String lawyerId;
  @JsonKey(name: 'consultation_type')
  final String consultationType;
  final String status;
  final String description;
  final double price;
  final String currency;

  @JsonKey(name: 'scheduled_start')
  final DateTime? scheduledStart;
  @JsonKey(name: 'scheduled_end')
  final DateTime? scheduledEnd;

  @JsonKey(name: 'confirmed_at')
  final DateTime? confirmedAt;
  @JsonKey(name: 'started_at')
  final DateTime? startedAt;
  @JsonKey(name: 'completed_at')
  final DateTime? completedAt;
  @JsonKey(name: 'cancelled_at')
  final DateTime? cancelledAt;

  final int? rating;
  final String? review;
  @JsonKey(name: 'cancellation_reason')
  final String? cancellationReason;

  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  const ConsultationModel({
    required this.id,
    required this.clientId,
    required this.lawyerId,
    required this.consultationType,
    required this.status,
    required this.description,
    required this.price,
    required this.currency,
    this.scheduledStart,
    this.scheduledEnd,
    this.confirmedAt,
    this.startedAt,
    this.completedAt,
    this.cancelledAt,
    this.rating,
    this.review,
    this.cancellationReason,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Convert model to entity
  ConsultationEntity toEntity() {
    return ConsultationEntity(
      id: id,
      clientId: clientId,
      lawyerId: lawyerId,
      type: _parseConsultationType(consultationType),
      status: _parseConsultationStatus(status),
      description: description,
      price: price,
      currency: currency,
      scheduledStart: scheduledStart,
      scheduledEnd: scheduledEnd,
      confirmedAt: confirmedAt,
      startedAt: startedAt,
      completedAt: completedAt,
      cancelledAt: cancelledAt,
      rating: rating,
      review: review,
      cancellationReason: cancellationReason,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  /// Convert entity to model
  factory ConsultationModel.fromEntity(ConsultationEntity entity) {
    return ConsultationModel(
      id: entity.id,
      clientId: entity.clientId,
      lawyerId: entity.lawyerId,
      consultationType: _consultationTypeToString(entity.type),
      status: _consultationStatusToString(entity.status),
      description: entity.description,
      price: entity.price,
      currency: entity.currency,
      scheduledStart: entity.scheduledStart,
      scheduledEnd: entity.scheduledEnd,
      confirmedAt: entity.confirmedAt,
      startedAt: entity.startedAt,
      completedAt: entity.completedAt,
      cancelledAt: entity.cancelledAt,
      rating: entity.rating,
      review: entity.review,
      cancellationReason: entity.cancellationReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  factory ConsultationModel.fromJson(Map<String, dynamic> json) =>
      _$ConsultationModelFromJson(json);

  Map<String, dynamic> toJson() => _$ConsultationModelToJson(this);

  /// Parse consultation type from string
  static ConsultationType _parseConsultationType(String type) {
    switch (type.toLowerCase()) {
      case 'emergency':
        return ConsultationType.emergency;
      case 'scheduled':
        return ConsultationType.scheduled;
      default:
        throw ArgumentError('Unknown consultation type: $type');
    }
  }

  /// Parse consultation status from string
  static ConsultationStatus _parseConsultationStatus(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return ConsultationStatus.pending;
      case 'confirmed':
        return ConsultationStatus.confirmed;
      case 'active':
        return ConsultationStatus.active;
      case 'completed':
        return ConsultationStatus.completed;
      case 'cancelled':
        return ConsultationStatus.cancelled;
      case 'failed':
        return ConsultationStatus.failed;
      case 'expired':
        return ConsultationStatus.expired;
      default:
        throw ArgumentError('Unknown consultation status: $status');
    }
  }

  /// Convert consultation type to string
  static String _consultationTypeToString(ConsultationType type) {
    return type.name;
  }

  /// Convert consultation status to string
  static String _consultationStatusToString(ConsultationStatus status) {
    return status.name;
  }
}
