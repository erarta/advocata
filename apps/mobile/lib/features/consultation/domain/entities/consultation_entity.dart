import 'package:equatable/equatable.dart';

/// Consultation status enum
enum ConsultationStatus {
  pending,    // Waiting for lawyer confirmation
  confirmed,  // Confirmed by lawyer, waiting to start
  active,     // Consultation is in progress
  completed,  // Successfully completed
  cancelled,  // Cancelled by client or lawyer
  failed,     // Failed (lawyer didn't show up, technical issues)
  expired,    // Time expired (no one started the consultation)
}

/// Consultation type enum
enum ConsultationType {
  emergency,  // Emergency (immediate, within 15-30 min)
  scheduled,  // Scheduled (pre-selected time slot)
}

/// Consultation entity - represents a consultation between client and lawyer
class ConsultationEntity extends Equatable {
  final String id;
  final String clientId;
  final String lawyerId;
  final ConsultationType type;
  final ConsultationStatus status;
  final String description;
  final double price;
  final String currency;

  /// Time slot for scheduled consultations (start and end time)
  final DateTime? scheduledStart;
  final DateTime? scheduledEnd;

  /// Actual times
  final DateTime? confirmedAt;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final DateTime? cancelledAt;

  /// Rating and review (after completion)
  final int? rating; // 1-5
  final String? review;

  /// Cancellation reason
  final String? cancellationReason;

  /// Timestamps
  final DateTime createdAt;
  final DateTime updatedAt;

  const ConsultationEntity({
    required this.id,
    required this.clientId,
    required this.lawyerId,
    required this.type,
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

  /// Check if consultation is emergency type
  bool get isEmergency => type == ConsultationType.emergency;

  /// Check if consultation is scheduled type
  bool get isScheduled => type == ConsultationType.scheduled;

  /// Check if consultation is in pending status
  bool get isPending => status == ConsultationStatus.pending;

  /// Check if consultation is confirmed
  bool get isConfirmed => status == ConsultationStatus.confirmed;

  /// Check if consultation is active
  bool get isActive => status == ConsultationStatus.active;

  /// Check if consultation is completed
  bool get isCompleted => status == ConsultationStatus.completed;

  /// Check if consultation is cancelled
  bool get isCancelled => status == ConsultationStatus.cancelled;

  /// Check if consultation is in a final state
  bool get isFinal =>
      status == ConsultationStatus.completed ||
      status == ConsultationStatus.cancelled ||
      status == ConsultationStatus.failed ||
      status == ConsultationStatus.expired;

  /// Check if consultation can be cancelled
  bool get canBeCancelled =>
      status == ConsultationStatus.pending ||
      status == ConsultationStatus.confirmed;

  /// Check if consultation can be rated
  bool get canBeRated =>
      status == ConsultationStatus.completed && rating == null;

  /// Get display name for status
  String get statusDisplayName {
    switch (status) {
      case ConsultationStatus.pending:
        return 'Ожидает подтверждения';
      case ConsultationStatus.confirmed:
        return 'Подтверждена';
      case ConsultationStatus.active:
        return 'Идет консультация';
      case ConsultationStatus.completed:
        return 'Завершена';
      case ConsultationStatus.cancelled:
        return 'Отменена';
      case ConsultationStatus.failed:
        return 'Не состоялась';
      case ConsultationStatus.expired:
        return 'Истекло время';
    }
  }

  /// Get display name for type
  String get typeDisplayName {
    switch (type) {
      case ConsultationType.emergency:
        return 'Экстренная';
      case ConsultationType.scheduled:
        return 'Запланированная';
    }
  }

  /// Get expected response time in minutes (for emergency consultations)
  int get expectedResponseTimeMinutes {
    return type == ConsultationType.emergency ? 30 : 0;
  }

  /// Get duration in minutes (if started and completed)
  int? get durationMinutes {
    if (startedAt != null && completedAt != null) {
      return completedAt!.difference(startedAt!).inMinutes;
    }
    return null;
  }

  @override
  List<Object?> get props => [
        id,
        clientId,
        lawyerId,
        type,
        status,
        description,
        price,
        currency,
        scheduledStart,
        scheduledEnd,
        confirmedAt,
        startedAt,
        completedAt,
        cancelledAt,
        rating,
        review,
        cancellationReason,
        createdAt,
        updatedAt,
      ];

  /// Copy with method for creating modified copies
  ConsultationEntity copyWith({
    String? id,
    String? clientId,
    String? lawyerId,
    ConsultationType? type,
    ConsultationStatus? status,
    String? description,
    double? price,
    String? currency,
    DateTime? scheduledStart,
    DateTime? scheduledEnd,
    DateTime? confirmedAt,
    DateTime? startedAt,
    DateTime? completedAt,
    DateTime? cancelledAt,
    int? rating,
    String? review,
    String? cancellationReason,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ConsultationEntity(
      id: id ?? this.id,
      clientId: clientId ?? this.clientId,
      lawyerId: lawyerId ?? this.lawyerId,
      type: type ?? this.type,
      status: status ?? this.status,
      description: description ?? this.description,
      price: price ?? this.price,
      currency: currency ?? this.currency,
      scheduledStart: scheduledStart ?? this.scheduledStart,
      scheduledEnd: scheduledEnd ?? this.scheduledEnd,
      confirmedAt: confirmedAt ?? this.confirmedAt,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
      cancelledAt: cancelledAt ?? this.cancelledAt,
      rating: rating ?? this.rating,
      review: review ?? this.review,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
