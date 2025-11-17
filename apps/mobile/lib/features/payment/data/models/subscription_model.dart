import 'package:json_annotation/json_annotation.dart';
import 'package:advocata/features/payment/domain/entities/subscription_entity.dart';

part 'subscription_model.g.dart';

@JsonSerializable()
class SubscriptionModel {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  final String plan;
  @JsonKey(name: 'is_active')
  final bool isActive;

  @JsonKey(name: 'start_date')
  final DateTime startDate;
  @JsonKey(name: 'end_date')
  final DateTime endDate;

  @JsonKey(name: 'consultations_limit')
  final int consultationsLimit;
  @JsonKey(name: 'consultations_used')
  final int consultationsUsed;

  @JsonKey(name: 'auto_renew')
  final bool autoRenew;
  @JsonKey(name: 'next_billing_date')
  final DateTime? nextBillingDate;

  @JsonKey(name: 'last_payment_id')
  final String? lastPaymentId;

  @JsonKey(name: 'cancelled_at')
  final DateTime? cancelledAt;
  @JsonKey(name: 'cancellation_reason')
  final String? cancellationReason;

  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;

  const SubscriptionModel({
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

  /// Convert model to entity
  SubscriptionEntity toEntity() {
    return SubscriptionEntity(
      id: id,
      userId: userId,
      plan: _parseSubscriptionPlan(plan),
      isActive: isActive,
      startDate: startDate,
      endDate: endDate,
      consultationsLimit: consultationsLimit,
      consultationsUsed: consultationsUsed,
      autoRenew: autoRenew,
      nextBillingDate: nextBillingDate,
      lastPaymentId: lastPaymentId,
      cancelledAt: cancelledAt,
      cancellationReason: cancellationReason,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  /// Convert entity to model
  factory SubscriptionModel.fromEntity(SubscriptionEntity entity) {
    return SubscriptionModel(
      id: entity.id,
      userId: entity.userId,
      plan: _subscriptionPlanToString(entity.plan),
      isActive: entity.isActive,
      startDate: entity.startDate,
      endDate: entity.endDate,
      consultationsLimit: entity.consultationsLimit,
      consultationsUsed: entity.consultationsUsed,
      autoRenew: entity.autoRenew,
      nextBillingDate: entity.nextBillingDate,
      lastPaymentId: entity.lastPaymentId,
      cancelledAt: entity.cancelledAt,
      cancellationReason: entity.cancellationReason,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) =>
      _$SubscriptionModelFromJson(json);

  Map<String, dynamic> toJson() => _$SubscriptionModelToJson(this);

  /// Parse subscription plan from string
  static SubscriptionPlan _parseSubscriptionPlan(String plan) {
    switch (plan.toLowerCase()) {
      case 'free':
        return SubscriptionPlan.free;
      case 'basic':
        return SubscriptionPlan.basic;
      case 'pro':
        return SubscriptionPlan.pro;
      case 'enterprise':
        return SubscriptionPlan.enterprise;
      default:
        throw ArgumentError('Unknown subscription plan: $plan');
    }
  }

  /// Convert subscription plan to string
  static String _subscriptionPlanToString(SubscriptionPlan plan) {
    return plan.name;
  }
}
