import 'package:equatable/equatable.dart';

/// Subscription plan enum
enum SubscriptionPlan {
  free,       // 0₽/month, 1 consultation
  basic,      // 490₽/month, 5 consultations
  pro,        // 990₽/month, 15 consultations
  enterprise, // 2990₽/month, unlimited
}

/// Subscription entity - represents user's subscription
class SubscriptionEntity extends Equatable {
  final String id;
  final String userId;
  final SubscriptionPlan plan;
  final bool isActive;

  /// Subscription period
  final DateTime startDate;
  final DateTime endDate;

  /// Consultation limits
  final int consultationsLimit; // -1 for unlimited
  final int consultationsUsed;

  /// Auto-renewal
  final bool autoRenew;
  final DateTime? nextBillingDate;

  /// Payment information
  final String? lastPaymentId;

  /// Cancellation
  final DateTime? cancelledAt;
  final String? cancellationReason;

  /// Timestamps
  final DateTime createdAt;
  final DateTime updatedAt;

  const SubscriptionEntity({
    required this.id,
    required this.userId,
    required this.plan,
    required this.isActive,
    required this.startDate,
    required this.endDate,
    required this.consultationsLimit,
    required this.consultationsUsed,
    required this.autoRenew,
    this.nextBillingDate,
    this.lastPaymentId,
    this.cancelledAt,
    this.cancellationReason,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Get monthly price for plan
  double get monthlyPrice {
    switch (plan) {
      case SubscriptionPlan.free:
        return 0;
      case SubscriptionPlan.basic:
        return 490;
      case SubscriptionPlan.pro:
        return 990;
      case SubscriptionPlan.enterprise:
        return 2990;
    }
  }

  /// Get plan display name
  String get planDisplayName {
    switch (plan) {
      case SubscriptionPlan.free:
        return 'Бесплатный';
      case SubscriptionPlan.basic:
        return 'Базовый';
      case SubscriptionPlan.pro:
        return 'Профессиональный';
      case SubscriptionPlan.enterprise:
        return 'Корпоративный';
    }
  }

  /// Get plan description
  String get planDescription {
    switch (plan) {
      case SubscriptionPlan.free:
        return '1 консультация в месяц';
      case SubscriptionPlan.basic:
        return '5 консультаций в месяц';
      case SubscriptionPlan.pro:
        return '15 консультаций в месяц';
      case SubscriptionPlan.enterprise:
        return 'Безлимитные консультации';
    }
  }

  /// Check if subscription is expired
  bool get isExpired => DateTime.now().isAfter(endDate);

  /// Check if subscription will expire soon (within 7 days)
  bool get isExpiringSoon {
    final daysUntilExpiry = endDate.difference(DateTime.now()).inDays;
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  }

  /// Check if user has consultations remaining
  bool get hasConsultationsRemaining {
    if (consultationsLimit == -1) return true; // Unlimited
    return consultationsUsed < consultationsLimit;
  }

  /// Get remaining consultations
  int get remainingConsultations {
    if (consultationsLimit == -1) return -1; // Unlimited
    return (consultationsLimit - consultationsUsed).clamp(0, consultationsLimit);
  }

  /// Get remaining days
  int get remainingDays {
    return endDate.difference(DateTime.now()).inDays.clamp(0, 9999);
  }

  /// Check if subscription is cancelled
  bool get isCancelled => cancelledAt != null;

  /// Check if can upgrade plan
  bool canUpgradeTo(SubscriptionPlan newPlan) {
    final currentIndex = SubscriptionPlan.values.indexOf(plan);
    final newIndex = SubscriptionPlan.values.indexOf(newPlan);
    return newIndex > currentIndex;
  }

  /// Check if can downgrade plan
  bool canDowngradeTo(SubscriptionPlan newPlan) {
    final currentIndex = SubscriptionPlan.values.indexOf(plan);
    final newIndex = SubscriptionPlan.values.indexOf(newPlan);
    return newIndex < currentIndex;
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        plan,
        isActive,
        startDate,
        endDate,
        consultationsLimit,
        consultationsUsed,
        autoRenew,
        nextBillingDate,
        lastPaymentId,
        cancelledAt,
        cancellationReason,
        createdAt,
        updatedAt,
      ];

  /// Copy with method
  SubscriptionEntity copyWith({
    String? id,
    String? userId,
    SubscriptionPlan? plan,
    bool? isActive,
    DateTime? startDate,
    DateTime? endDate,
    int? consultationsLimit,
    int? consultationsUsed,
    bool? autoRenew,
    DateTime? nextBillingDate,
    String? lastPaymentId,
    DateTime? cancelledAt,
    String? cancellationReason,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return SubscriptionEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      plan: plan ?? this.plan,
      isActive: isActive ?? this.isActive,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      consultationsLimit: consultationsLimit ?? this.consultationsLimit,
      consultationsUsed: consultationsUsed ?? this.consultationsUsed,
      autoRenew: autoRenew ?? this.autoRenew,
      nextBillingDate: nextBillingDate ?? this.nextBillingDate,
      lastPaymentId: lastPaymentId ?? this.lastPaymentId,
      cancelledAt: cancelledAt ?? this.cancelledAt,
      cancellationReason: cancellationReason ?? this.cancellationReason,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
